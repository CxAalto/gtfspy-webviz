class window.Trip

  typeNames = [
    "Tram",
    "Subway",
    "Rail",
    "Bus",
    "Ferry",
    "Cable car",
    "Gondola",
    "Funicular",
    "Walk"
  ]

  typeColors = [
    'rgb(77,175,74)',  # green
    'rgb(255,127,0)',  # orange
    'rgb(228,26,28)', # red
    'rgb(55,126,184)', # blue
    'rgb(255,255,51)', # yellow
    'rgb(166,86,40)',   # brown
    'rgb(152,78,163)', # violet
    'rgb(247,129,191)', # pink
    'rgb(150,150,150)' # grey
  ]

  constructor: (tripdata) ->
    @times = tripdata['times']
    if tripdata['delays']?
      @delays = tripdata['delays']
    else
      ### a hack for the time being: ###
      @delays = (0 for el in @times)
    @lats = tripdata['lats']
    @lons = tripdata['lons']
    @name = ""+tripdata['name']
    @type = tripdata['route_type']
    ###
    convert more refined
    gtfs route_type extensions
    to the more standard ones:
    ###
    # https://support.google.com/transitpartners/answer/3520902?hl=en
    @type = window.Trip.mapType(@type)
    [@start_time, ... , @end_time] = @times
    @next_index = null
    @p = null
    @latlons = []
    for i in [0...@lats.length]
      @latlons.push(new L.LatLng(@lats[i], @lons[i]))

  @mapType: (type) ->
    if type == 109 # suburban railway
      type = 2 # rail
    if type == 800 # trolley bus
      type = 3 # bus
    return type

  @getTypeNames: ->
    return typeNames

  @getTypeColors: ->
    return typeColors

  @getColorByType: (type) ->
    type = window.Trip.mapType(type)
    if type?
      if type == -1 # treat walking separately:
        return typeColors[typeColors.length-1]
      if type > typeColors.length - 1
        console.log("type observed:", type)
      return typeColors[type]
    else
      console.log("No type specified")
      return null


  isOn: (time) ->
    return (time >= @start_time) and (time <= @end_time)

  hasStarted: (time) ->
    return time >= @start_time

  hasEnded: (time) ->
    return time >= @end_time

  getName: ->
    return @name

  getColorByType: ->
    ### type is an int as specifiec by gtfs ###
    if @type?
      if @type == -1 # treat walking separately:
        return typeColors[typeColors.length-1]
      if @type > typeColors.length - 1
        console.log("type observed:", @type)
      return typeColors[@type]
    else
      console.log("No type specified")
      return null


  getLatLngDelayNextIndex: (time) ->
    next_index = _.sortedIndex(@times, time)
    if next_index is 0
      lat = @lats[0]
      lon = @lons[0]
      delay = @delays[0]
    else if next_index is @times.length
      # just some bug overkill for the case where
      tmp_index = @times.length-1
      lat = @lats[tmp_index]
      lon = @lons[tmp_index]
      delay = @delays[tmp_index]
    else
      p = (time - @times[next_index-1])/(@times[next_index]- @times[next_index-1])
      lat = @lats[next_index]*p+@lats[next_index-1]*(1-p)
      lon = @lons[next_index]*p+@lons[next_index-1]*(1-p)
      delay = @delays[next_index]*p+@delays[next_index-1]*(1-p)

    newLatLng = new L.LatLng(lat, lon)
    return [newLatLng, delay, next_index]

  getTailLatLngs: (time, tail_seconds) ->
    [tailLatLng, tail_delay, tail_next_index] = @getLatLngDelayNextIndex(time-tail_seconds)
    [curLatLng, delay, next_index] = @getLatLngDelayNextIndex(time)
    tailLatLngs = @latlons.slice(tail_next_index, next_index)
    tailLatLngs.push(curLatLng)
    tailLatLngs.unshift(tailLatLng)
    return tailLatLngs
