class GtfsService

  constructor: (@$log, @$http, @$q, @$rootScope, @$location) ->
    @cache = {}
    # path prefix:
    @$log.debug("Running on: " + @$location.host())
    if @$location.host() in ["localhost", "127.0.0.1"]
      @pp = ""
    else
      # i.e. if on the production server:
      @pp = "/webviz/"

  fetch_databases: =>
    @$log.debug "fetching list of databases, and timezones"
    deferred = @$q.defer()
    # get list of GTFS databases
    @$http.get(@pp+"/gtfsdbs")
        .success( (json) =>
            @$rootScope.appdata.dbfnames = json['dbfnames']
            @$rootScope.appdata.timezones = json['timezones']
            # if not @$rootScope.dbfname?
            #   @$rootScope.appdata.dbfname = json['dbfnames'][0]
            #  console.log @$rootScope.appdata.dbfname
            @$log.debug "fetched list of databases and timezones"
            @$log.debug @$rootScope
            deferred.resolve()
          )
        .error( => deferred.reject() )
    return deferred.promise

  fetch_stats: () =>
    dbfname = @$rootScope.appdata.dbfname
    @$log.debug "fetching stats for " + dbfname
    deferred = @$q.defer()
    @$http.get(@pp+"/gtfsstats?dbfname="+dbfname)
        .success( (json) =>
            deferred.resolve(json)
            @$log.debug "fetched stats for" + dbfname
            # set start, end and center of time span:
            @$rootScope.appdata.data_start_min=json['start_time_ut']
            @$rootScope.appdata.data_start_max=json['end_time_ut']
            @$rootScope.appdata.data_start=0.5*(json['start_time_ut']+json['end_time_ut'])
            # set map bounds according to LatLngBounds format
            @$rootScope.appdata.data_map_bounds = [[json['lat_min'], json['lon_min']],[json['lat_max'], json['lon_max']]]
            @$rootScope.$broadcast('newdbselected')
            @$rootScope.appdata.data_loadable = true
        )
        .error( => deferred.reject() )
    return deferred.promise

  get_anim_trips: () =>
    @$log.debug "fetching animation data"
    # get all (parts) of trips taking place between start_time and end_time
    dbfname = @$rootScope.appdata.dbfname
    @$rootScope.appdata.anim_data_ready = false
    @$rootScope.appdata.anim_stopped = true
    start_time = Number(@$rootScope.appdata.data_start)
    end_time = start_time + Number(@$rootScope.appdata.duration)
    use_shapes = @$rootScope.appdata.use_shapes
    cstr = 'gt' + "_" + start_time + "_" + end_time + "_" + dbfname + "_" + use_shapes
    @$rootScope.appdata.sim_time_min = start_time
    @$rootScope.appdata.sim_time = start_time
    @$rootScope.appdata.sim_time_max = end_time

    deferred = @$q.defer()
    if @cache[cstr]
      # simple cache
      @$log.debug "fetched animation data"
      deferred.resolve(@cache[cstr])
    else
      thisservice = @ # weird scoping of "this" in the below @$http.get...
      shapestr = 0
      if use_shapes
        shapestr = 1

      @$http.get(@pp+"/gtfs_viz?tstart="+start_time+"&tend="+end_time +
                  "&dbfname="+dbfname+"&use_shapes=" + shapestr)
        .success(
          (json) ->
            trip_data = json['trips']
            # ( @ corresponds to a http request object here now)
            thisservice.$log.debug "fetched animation data"
            thisservice.cache[cstr] = trip_data
            deferred.resolve(trip_data)
            ###### thisservice.$rootScope.$broadcast('newgtfsdata')
          )
    return deferred.promise

  fetch_stop_data: () ->

    dbfname = @$rootScope.appdata.dbfname
    start_time = Number(@$rootScope.appdata.data_start)
    end_time = start_time + Number(@$rootScope.appdata.duration)
    cstr = 'stopdata' + "_" + start_time + "_" + end_time + "_" + dbfname

    deferred = @$q.defer()
    if @cache[cstr]
      # simple cache
      # @$rootScope.appdata.stop_data = @cache[cstr]
      deferred.resolve(@cache[cstr])
      @$rootScope.$broadcast('newstopdata')
    else
      thisservice = @ # weird scoping of "this" in the below @$http.get...
      query = "/stopdata?tstart="+start_time+"&tend="+end_time+"&dbfname="+dbfname
      @$http.get(@pp+query)
        .success(
          (stop_data) ->
            # ( @ corresponds to a http request object here now)
            thisservice.cache[cstr] = stop_data
            deferred.resolve(stop_data)
            # thisservice.$rootScope.appdata.stop_data = stop_data
            # thisservice.$rootScope.$broadcast('newstopdata')
          )
    return deferred.promise

  fetch_segment_data: () ->
    @$log.debug "fetching segment data"


    dbfname = @$rootScope.appdata.dbfname
    start_time = Number(@$rootScope.appdata.data_start)
    end_time = start_time + Number(@$rootScope.appdata.duration)
    shapestr = 0
    use_shapes = @$rootScope.appdata.use_shapes
    if use_shapes
      shapestr = 1
    cstr = 'segmentdata' + "_" + start_time + "_" + end_time + "_" + dbfname + "_" + shapestr

    deferred = @$q.defer()
    if @cache[cstr]
      # simple cache
      @$rootScope.appdata.segment_data = @cache[cstr]
      @$log.debug "fetched segment data"
      deferred.resolve(@cache[cstr])
    else
      thisservice = @ # weird scoping of "this" in the below @$http.get...
      query = "/segmentdata?tstart="+start_time+"&tend="+end_time+"&dbfname="+dbfname + "&use_shapes=" + shapestr
      @$http.get(@pp+query)
        .success(
          (segment_data) ->
            # ( @ corresponds to a http request object here now)
            thisservice.$log.debug "fetched segment data"
            deferred.resolve(segment_data)
            thisservice.cache[cstr] = segment_data
      )
    return deferred.promise


  fetch_route_data: () ->

    @$log.debug "fetching route data"
    dbfname = @$rootScope.appdata.dbfname

    shapestr = 0
    use_shapes = @$rootScope.appdata.use_shapes
    if use_shapes
      shapestr = 1
    cstr = 'getroutes' + "_" + dbfname + "_" + shapestr

    deferred = @$q.defer()
    if @cache[cstr]
      # simple cache
      @$log.debug "fetched route data"
      deferred.resolve(@cache[cstr])
    else
      thisservice = @ # weird scoping of "this" in the below @$http.get...
      query = "/getroutes?"+"&dbfname="+dbfname + "&use_shapes=" + shapestr
      @$http.get(@pp + query)
        .success(
          (route_data) ->
            # ( @ corresponds to a http request object here now)
            thisservice.$log.debug "fetched route data"
            thisservice.cache[cstr] = route_data
            deferred.resolve(route_data)
          )
    return deferred.promise

  get_trips_per_day: () ->
    dbfname = @$rootScope.appdata.dbfname
    @$log.debug "fetching tripsperdaydata"
    cstr = 'tripsperday' + "_" + dbfname

    deferred = @$q.defer()

    if @cache[cstr]
      # simple cache
      data = @cache[cstr]
      deferred.resolve(data)
      @$log.debug "fetched route data"
    else
      query = "/gtfstripsperday?dbfname=" + dbfname
      thisservice = @
      @$http.get(@pp + query)
        .success(
          (statsdata) ->
            # ( @ corresponds to a http request object here now)
            thisservice.$log.debug "fetched tripsperday data"
            thisservice.cache[cstr] = statsdata
            deferred.resolve(statsdata)
          )
        .error( => deferred.reject() )
    return deferred.promise


  get_spreading_trips: () ->
    @$log.debug "fetching spreading data"
    # get all (parts) of trips taking place between start_time and end_time
    dbfname = @$rootScope.appdata.dbfname
    @$rootScope.appdata.spreading_data_ready = false
    @$rootScope.appdata.spreading_stopped = true
    start_time = Number(@$rootScope.appdata.data_start)
    end_time = start_time + Number(@$rootScope.appdata.duration)
    use_shapes = @$rootScope.appdata.use_shapes
    @$rootScope.appdata.spreading_sim_time_min = start_time
    @$rootScope.appdata.spreading_sim_time = start_time
    @$rootScope.appdata.spreading_sim_time_max = end_time

    lat = @$rootScope.appdata.spreading_lat
    lon = @$rootScope.appdata.spreading_lon

    # get time-dependent 'spreading' trips starting between start_time and end_time
    deferred = @$q.defer()
    @$http.get(@pp + "/spreading?tstart="+start_time+"&tend="+end_time+"&lat="+lat+"&lon="+lon+"&dbfname="+dbfname)
      .success( (json) =>
                trip_data = json['trips']
                console.log(trip_data)
                deferred.resolve(trip_data)
              )
      .error( => deferred.reject() )
    return deferred.promise

servicesModule.service('GtfsService', ['$log', '$http', '$q', '$rootScope', '$location', GtfsService])


