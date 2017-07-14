class MapCtrl
    constructor: (@$log, @$scope, @$rootScope, @$timeout, @GtfsService) ->
        cartoDBdark = L.tileLayer(
          'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'}
        )

        cartoDBlight = L.tileLayer(
          'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'}
        )

        @map = L.map('map',
          {
            zoom: 12,
            center: [60.1672803, 24.9429589],
            layers: [cartoDBlight],
            zoomControl: false,
            attributionControl: true
          }
        )
        zoomControl = L.control.zoom({position: "topleft"}).addTo(@map)
        L.control.scale(position: "bottomright").addTo(@map)

        baseMaps = {"light": cartoDBlight, "dark":cartoDBdark}
        # L.control.attribution({position: 'bottomright'}).addTo(@map)

        L.control.layers(baseMaps, []).addTo(@map);
        @$scope.$on('play', @play)
        @$scope.$on('play_spreading', @play_spreading)
        @$scope.$on('newdbselected', @set_map_bounds)
        @$scope.$on('newdbselected', @clear_layers)
        @$scope.$on('redrawstops', @draw_stops)
        @$scope.$on('redrawsegments', @draw_segments)
        @$scope.$on('redrawroutes', @draw_routes)
        @$scope.$on('animvisibility', @toggle_anim_layer)
        @$scope.$on('spreadingvisibility', @toggle_spreading_layer)
        @$scope.$on('step_anim', @animate_gtfs_step)
        @$scope.$on('step_spreading', @spreading_step)
        @$scope.$on('togglestopdata', @toggle_stop_layer)
        @$scope.$on('togglesegmentdata', @toggle_segment_layer)
        @$scope.$on('toggleroutedata', @toggle_routes_layer)
        @$scope.$on('mapsizechanged', @resize_map)
        @$scope.$on('load_anim_data', @load_and_init_anim)
        @$scope.$on('load_spreading_data', @load_and_init_spreading)
        @$scope.$on('loadstopdata', @load_and_draw_stops)
        @$scope.$on('loadsegmentdata', @load_and_draw_segments)
        @$scope.$on('loadroutedata', @load_and_draw_routes)

        # hack: timeout for resizing the map after the page has loaded
        @$timeout(@map._onResize, 2000)

        # these colors are taken from http://colorbrewer2.org/
        @categoryColors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928']
        @triptypenames = window.Trip.getTypeNames()

        # layers:
        @gtfsanimlayer = L.layerGroup([])
        @stoplayer = L.layerGroup([])
        @segmentlayer = L.layerGroup([])
        @routelayer = L.layerGroup([])
        @spreadinglayer = L.layerGroup([])
        @spreadingoriginlayer = L.layerGroup([])
        # inits layers:
        @map.on('click', @set_spreading_latlng)

    set_spreading_latlng: (e) =>
      if @$rootScope.appdata.tabToShow == "SPREADING"
        @$log.debug("Setting spreading origin to:" , e.latlng)
        @$rootScope.appdata.spreading_lat = e.latlng.lat
        @$rootScope.appdata.spreading_lon = e.latlng.lng
        if @$rootScope.appdata.spreading_visible
          @add_spreading_origin()

    add_spreading_origin: () =>
      lat = @$rootScope.appdata.spreading_lat
      lon = @$rootScope.appdata.spreading_lon
      circle = L.circleMarker([lat, lon], {
        stroke: false,
        fillColor: "orange"
        fillOpacity: 1.0,
        title: "Spreading origin",
      })
      circle.setRadius(10).bindLabel("Spreading origin", {noHide: false})
      if @map.hasLayer(@spreadingoriginlayer)
        @map.removeLayer(@spreadingoriginlayer)
      @spreadingoriginlayer = circle
      @toggle_spreading_layer()
      # updates visibility of the spreadingorigin as necessary

    clear_layers: (event) =>
      for layer in [@gtfsanimlayer, @stoplayer, @segmentlayer,
                    @routelayer, @spreadinglayer, @spreadingoriginlayer]
        if @map.hasLayer(layer)
          @map.removeLayer(layer)
        layer = L.layerGroup([])

    resize_map: (event) =>
      @map.invalidateSize()

    set_map_bounds: (event) =>
      @map.fitBounds(@$rootScope.appdata.data_map_bounds)

    toggle_routes_layer: (event) =>
      console.log('toggling!')
      if @$rootScope.appdata.show_route_data
        if not @map.hasLayer(@routelayer)
          @routelayer.addTo(@map)
      else
        if @map.hasLayer(@routelayer)
          @map.removeLayer(@routelayer)

    toggle_anim_layer: (event) =>
      if @$rootScope.appdata.anim_visible
        if not @map.hasLayer(@gtfsanimlayer)
          @gtfsanimlayer.addTo(@map)
      else
        if @map.hasLayer(@gtfsanimlayer)
          @map.removeLayer(@gtfsanimlayer)

    toggle_spreading_layer: (event) =>
      if @$rootScope.appdata.spreading_visible
        if not @map.hasLayer(@spreadinglayer)
          console.log @spreadinglayer
          @spreadinglayer.addTo(@map)
        if not @map.hasLayer(@spreadingoriginlayer)
          @spreadingoriginlayer.addTo(@map)
      else
        if @map.hasLayer(@spreadinglayer)
          @map.removeLayer(@spreadinglayer)
        if @map.hasLayer(@spreadingoriginlayer)
          @map.removeLayer(@spreadingoriginlayer)

    toggle_stop_layer: (event) =>
      if @$rootScope.appdata.show_stop_data
        if not @map.hasLayer(@stoplayer)
          @stoplayer.addTo(@map)
      else
        if @map.hasLayer(@stoplayer)
          @map.removeLayer(@stoplayer)

    toggle_segment_layer: (event) =>
      if @$rootScope.appdata.show_segment_data
        if not @map.hasLayer(@segmentlayer)
          @segmentlayer.addTo(@map)
      else
        if @map.hasLayer(@segmentlayer)
          @map.removeLayer(@segmentlayer)

    play: (event, args) =>
      if args.play
        @animate_gtfs_step(false)

    play_spreading: (event, args) =>
      console.log args.play
      if args.play
        @spreading_step(false)

    load_and_init_anim: () =>
      @$rootScope.appdata.loading = true
      promise = @GtfsService.get_anim_trips()
      t = @
      promise.then((data) ->
        t.$rootScope.appdata.anim_data = data
        t.init_gtfs_anim()
        t.$rootScope.appdata.loading = false
      )

    load_and_init_spreading: () =>
      @$rootScope.appdata.loading = true
      promise = @GtfsService.get_spreading_trips()
      t = @
      promise.then((data) ->
        t.$rootScope.appdata.spreading_data = data
        t.init_gtfs_spreading()
        t.$rootScope.appdata.loading = false
      )

    load_and_draw_stops: () =>
      @$rootScope.appdata.loading = true
      promise = @GtfsService.fetch_stop_data()
      t = @
      promise.then( (data) ->
        t.$rootScope.appdata.stop_data = data
        t.draw_stops()
        t.$rootScope.appdata.loading = false
      )

    load_and_draw_segments: () =>
      @$rootScope.appdata.loading = true
      promise = @GtfsService.fetch_segment_data()
      t = @
      promise.then( (data) ->
        t.$rootScope.appdata.segment_data = data
        t.draw_segments()
        t.$rootScope.appdata.loading = false
      )

    load_and_draw_routes: () =>
      @$rootScope.appdata.loading = true
      promise = @GtfsService.fetch_route_data()
      t = @
      promise.then( (data) ->
        t.$rootScope.appdata.route_data = data
        t.draw_routes()
        t.$rootScope.appdata.loading = false
      )


    init_gtfs_anim: () =>
      @$log.debug "initialising animation"
      if @map.hasLayer(@gtfsanimlayer)
        @map.removeLayer(@gtfsanimlayer)
      @gtfsanimlayer = L.layerGroup([])
      @gtfsanimdata = null

      trip_markers = []
      trip_tails = []
      trip_layers = []
      trips = []

      trip_data = @$rootScope.appdata.anim_data
      for i in [0...trip_data.length]
        trip = new Trip(trip_data[i])
        circle = L.circleMarker([0, 0], {
            stroke: false,
            fillColor: trip.getColorByType(),
            fillOpacity: 1.0,
            title: "unselected",
        })

        # remove vehicle from sight if it is not visible
        circle.setRadius(4).bindLabel(trip.getName(), {noHide: false})
        trip_markers.push(circle)

        pointList = [new L.LatLng(0, 0)]
        tail = new L.Polyline(pointList, {
          color: trip.getColorByType(),
          weight: 5,
          opacity: 0.5,
          smoothFactor: 1
          }
        )
        trips.push(trip)
        trip_tails.push(tail)
        lg = L.layerGroup([circle, tail])
        trip_layers.push(lg)

      @gtfsanimdata = {}
      @gtfsanimdata.trip_markers = trip_markers
      @gtfsanimdata.trip_tails = trip_tails
      @gtfsanimdata.trip_layers = trip_layers
      @gtfsanimdata.trips = trips
      @gtfsanimlayer = L.layerGroup(trip_layers)
      if @$rootScope.appdata.anim_visible
        @gtfsanimlayer.addTo(@map)
      @$rootScope.appdata.anim_data_ready = true
      @animate_gtfs_step()
      @$log.debug "initialised animation"

    animate_gtfs_step: (run_once=true) =>
      appdata = @$rootScope.appdata
      if not run_once and appdata.anim_stopped
        return

      trip_markers = @gtfsanimdata.trip_markers
      trip_tails = @gtfsanimdata.trip_tails
      trip_layers = @gtfsanimdata.trip_layers
      trips = @gtfsanimdata.trips

      time_last = new Date().getTime()

      n_vehicles = 0

      n_vehicles_by_type = {}

      for i in [0...trips.length]
        trip = trips[i]
        trip_type_str = @triptypenames[Number(trip.type)]
        # should the vehicle be shown? (considering also tail lengths)
        if trip.hasStarted(appdata.sim_time+appdata.tail_length) and
            (not trip.hasEnded(appdata.sim_time-appdata.tail_length) )

          if not @gtfsanimlayer.hasLayer(trip_layers[i])
            # if layer not visible, make it visible:
            @gtfsanimlayer.addLayer(trip_layers[i])

          # compute new locations
          [newLatLng, cur_delay, _foo] = trip.getLatLngDelayNextIndex(appdata.sim_time)
          tail = trip.getTailLatLngs(appdata.sim_time, appdata.tail_length)
          trip_tails[i].setLatLngs(tail)
          # select color
          trip_markers[i].setStyle({fillOpacity:1.0})
          # set location
          trip_markers[i].setLatLng(newLatLng)
          # counting of active vehicles
          if not n_vehicles_by_type[trip_type_str]?
            n_vehicles_by_type[trip_type_str] = 0
          n_vehicles_by_type[trip_type_str] += 1
          n_vehicles = n_vehicles + 1
        else
          # remove vehicle from sight if it is not visible
          @gtfsanimlayer.removeLayer(trip_layers[i])

      # rerun if end time has been reached
      if appdata.sim_time > appdata.sim_time_max
        appdata.sim_time = appdata.sim_time_min
      else
        if appdata.sim_time < appdata.sim_time_min
          appdata.sim_time = appdata.sim_time_max

      time_now = new Date()
      time_spent = time_now-time_last
      refresh_target = 40
      time_out = Math.max(20, refresh_target-time_spent)
      time_last = time_now
      new_time = @$rootScope.appdata.sim_time+(time_spent+time_out)*appdata.sim_speed/1000.0
      @$rootScope.appdata.sim_time = new_time
      @$rootScope.appdata.n_vehicles = n_vehicles
      @$rootScope.appdata.n_vehicles_by_type = n_vehicles_by_type
      # 'sleep' for some time, use angulars $timeout
      @$timeout( () =>
                  @animate_gtfs_step(false)
                , time_out)

    draw_stops: () =>
      @$log.debug "drawing stops"
      if @map.hasLayer(@stoplayer)
        @map.removeLayer(@stoplayer)

      if not @$rootScope.appdata.stop_data?
        @$log.debug "no segments drawn due to no stop data"
        return

      stop_data = @$rootScope.appdata.stop_data
      stop_data.sort( (a,b) ->
        return b['count']-a['count']
      )

      count_max = 0
      for stop in stop_data
        if stop['count'] > count_max
          count_max = stop['count']

      markers = []
      cmap = new window.ColorMap(["yellow", "red"], [0, count_max], 100)

      for stop in stop_data
        lat = stop['lat']
        lon = stop['lon']
        count = stop['count']
        name = stop['name']

        if @$rootScope.appdata.color_and_size_stops_by_count
          if count == 0 #do not draw if count equals zero
            continue
          color = cmap.get_color(count)
          name = name + " (" + count + ")"
          radius = Math.sqrt(count/count_max)*15
        else
          color = "red"
          radius = 3
          name = "" + name

        newLatLng = new L.LatLng(lat, lon)
        circle = L.circleMarker([0, 0],
          {
            stroke: false,
            fillColor: color,
            fillOpacity: 1.0,
            title: "",
          }
        ).setRadius(radius)
        .bindLabel(name, {noHide: false})
        .setLatLng(newLatLng)
        markers.push(circle)
      @stoplayer = L.layerGroup(markers)
      @stoplayer.addTo(@map)
      @$log.debug "drew " + markers.length + " stops"


    draw_segments: () =>
      @$log.debug "drawing segments"

      if not @$rootScope.appdata.segment_data?
        @$log.debug "no segments drawn due to no segment data"
        return


      if @map.hasLayer(@segmentlayer)
        @map.removeLayer(@segmentlayer)
      segment_data = @$rootScope.appdata.segment_data

      count_max = 1
      for seg in segment_data
        if seg['count'] > count_max
          count_max = seg['count']

      cmap = new window.ColorMap(["yellow", "red"], [0, count_max], 100)

      segments = []
      for segment in segment_data
        lats = segment['lats']
        lons = segment['lons']
        count = segment['count']
        name = segment['name']

        if @$rootScope.appdata.color_and_size_segments_by_count
          color = cmap.get_color(count)
          width = 15*count/count_max
        else
          color = "blue"
          width = 2

        latLngs = []
        for i in [0..lats.length-1]
          latLngs.push(new L.LatLng(lats[i], lons[i]))
        segment = new L.Polyline(latLngs, {
          color: color,
          weight: width,
          opacity: 0.5,
          smoothFactor: 1
          }
        ).bindLabel(name + " (" + count + ")", {noHide: false})
        segments.push(segment)
      @segmentlayer = L.layerGroup(segments)
      @map.addLayer(@segmentlayer)
      @$log.debug "drew segments"


    draw_routes: () =>
      @$log.debug "drawing routes"

      if @map.hasLayer(@routelayer)
        @map.removeLayer(@routelayer)
      route_data = @$rootScope.appdata.route_data

      routes = []

      # defining these functions outside of the loop so that no multiple copies
      # of the same function are needed
      on_hover = (e) ->
        rl = e.target
        rl.setStyle({
          opacity: 1.0,
          weight: 10}
        )

      on_mouseout = (e) ->
        rl = e.target
        rl.setStyle({
          opacity: 0.5,
          weight: 4}
        )

      n_colors = @categoryColors.length
      color_i = 0
      agency_to_color = {}

      for route in route_data
        # select color for the route:
        if @$rootScope.appdata.color_by_route
          color = @categoryColors[color_i % n_colors]
          color_i += 1
        else if @$rootScope.appdata.color_by_agency
          agency = route["agency"]
          if agency of agency_to_color
            color = agency_to_color[agency]
          else
            console.log "new color"
            color = @categoryColors[color_i % n_colors]
            agency_to_color[agency] = color
            color_i += 1
        else
          color = window.Trip.getColorByType(route['type'])

        lats = route['lats']
        lons = route['lons']
        if lats.length == 0
          @$log.debug route
          @$log.debug "no coordinates specified for route"+route['name']
          continue

        latLngs = []

        if @$rootScope.appdata.add_offset_to_routes
          offset_lat = (Math.random()-0.5)*1000/6371000
          lon_offset_base = (Math.random()-0.5)*1000/6371000
        else
          offset_lat = 0
          lon_offset_base = 0

        for i in [0..lats.length-1]
          offset_lon = lon_offset_base / Math.sin(Math.PI-Math.PI/180.0*Math.abs(lats[i]))
          latLngs.push(new L.LatLng(lats[i]+offset_lat, lons[i]+offset_lon))

        routeLine = new L.Polyline(latLngs, {
          color: color,
          weight: 4,
          opacity: 0.5,
          smoothFactor: 1
          })

        if @$rootScope.appdata.color_by_agency
          routeLine.bindLabel("" + route['name'] + " \n " + route["agency"], {noHide: false, direction: 'auto' })
        else
          routeLine.bindLabel("" + route['name'], {noHide: false, direction: 'auto' })

        routeLine.on('mouseover', on_hover)
        routeLine.on('mouseout', on_mouseout)

        routes.push(routeLine)

      @routelayer = L.layerGroup(routes)
      @map.addLayer(@routelayer)
      @$log.debug "drew routes"


    init_gtfs_spreading: () =>
      @$log.debug "initialising spreading"
      if @map.hasLayer(@spreadinglayer)
        @map.removeLayer(@spreadinglayer)
      @spreadinglayer = L.layerGroup([])
      @spreadingdata = null

      trip_markers = []
      trip_tails = []
      trip_layers = []
      trips = []

      trip_data = @$rootScope.appdata.spreading_data
      for i in [0...trip_data.length]
        trip = new Trip(trip_data[i])
        circle = L.circleMarker([0, 0], {
            stroke: false,
            fillColor: trip.getColorByType(),
            fillOpacity: 1.0,
            title: "unselected",
        })

        # remove vehicle from sight if it is not visible
        circle.setRadius(4).bindLabel(trip.getName(), {noHide: false})
        trip_markers.push(circle)

        pointList = [new L.LatLng(0, 0)]
        tail = new L.Polyline(pointList, {
          color: trip.getColorByType(),
          weight: 5,
          opacity: 0.5,
          smoothFactor: 1
          }
        )
        trips.push(trip)
        trip_tails.push(tail)
        lg = L.layerGroup([circle, tail])
        trip_layers.push(lg)

      @spreadingdata = {}
      @spreadingdata.trip_markers = trip_markers
      @spreadingdata.trip_tails = trip_tails
      @spreadingdata.trip_layers = trip_layers
      @spreadingdata.trips = trips
      @spreadinglayer = L.layerGroup(trip_layers)
      if @$rootScope.appdata.spreading_visible
        @spreadinglayer.addTo(@map)
      @$rootScope.appdata.spreading_data_ready = true
      @spreading_step()
      @$log.debug "initialised spreading"

    spreading_step: (run_once=true) =>
      appdata = @$rootScope.appdata
      if not run_once and appdata.spreading_stopped
        return

      trip_markers = @spreadingdata.trip_markers
      trip_tails = @spreadingdata.trip_tails
      trip_layers = @spreadingdata.trip_layers
      trips = @spreadingdata.trips

      time_last = new Date().getTime()

      n_vehicles = 0
      n_vehicles_by_type = {}

      for i in [0...trips.length]
        trip = trips[i]
        trip_type_str = @triptypenames[Number(trip.type)]
        # should the vehicle be shown? (considering also tail lengths)
        if trip.hasStarted(appdata.spreading_sim_time)

          if not @spreadinglayer.hasLayer(trip_layers[i])
            # if layer not visible, make it visible:
            @spreadinglayer.addLayer(trip_layers[i])

          # compute new locations
          [newLatLng, cur_delay, _foo] = trip.getLatLngDelayNextIndex(appdata.spreading_sim_time)
          tail = trip.getTailLatLngs(appdata.spreading_sim_time, Infinity)
          trip_tails[i].setLatLngs(tail)
          # select color
          trip_markers[i].setStyle({fillOpacity:1.0})
          # set location
          trip_markers[i].setLatLng(newLatLng)
          # counting of active vehicles
          if not n_vehicles_by_type[trip_type_str]?
            n_vehicles_by_type[trip_type_str] = 0
          n_vehicles_by_type[trip_type_str] += 1
          n_vehicles = n_vehicles + 1
        else
          # remove vehicle from sight if it is not visible
          @spreadinglayer.removeLayer(trip_layers[i])

      # rerun if end time has been reached
      if appdata.spreading_sim_time > appdata.spreading_sim_time_max
        appdata.spreading_sim_time = appdata.spreading_sim_time_min
      else
        if appdata.spreading_sim_time < appdata.spreading_sim_time_min
          appdata.spreading_sim_time = appdata.spreading_sim_time_max

      time_now = new Date()
      time_spent = time_now-time_last
      refresh_target = 40
      time_out = Math.max(20, refresh_target-time_spent)
      time_last = time_now
      new_time = @$rootScope.appdata.spreading_sim_time+(time_spent+time_out)*appdata.spreading_sim_speed/1000.0
      @$rootScope.appdata.spreading_sim_time = new_time
      @$rootScope.appdata.n_vehicles = n_vehicles
      @$rootScope.appdata.n_vehicles_by_type = n_vehicles_by_type
      # 'sleep' for some time, use angulars $timeout
      @$timeout( () =>
                  @spreading_step(false)
                , time_out)



controllersModule.controller('MapCtrl', ['$log', '$scope', '$rootScope', '$timeout', 'GtfsService', MapCtrl])
