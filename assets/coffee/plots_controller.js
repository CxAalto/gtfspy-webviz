class PlotsController

  constructor: (@$scope, @$rootScope, @$log, @GtfsService, @$filter) ->

    @$scope.load_plots = () =>
      @$log.debug "fetching plots data"
      rs = @$rootScope
      promise = @GtfsService.get_trips_per_day()
      tc = @
      promise.then( (json)->
        # datefilter = tc.$filter('date')
        # dbfname = tc.$rootScope.appdata.dbfname
        # tz = tc.$rootScope.appdata.timezones[dbfname]
        # dates = (datefilter(date_ut*1000, "yyyy-MM-dd", tz) for date_ut in json['day_start_uts'])

        data = {
          x : json['dates']
          y : json['trip_counts'],
          name : "Trips per day",
          type: 'bar'
        }

        layout = {
          xaxis: {
            title: 'Day start'
          },
          yaxis: {
            title: 'Number of trips per day',
          }
          title: "Trips per day"
        }
        np = Plotly.newPlot('tripsperdayplot', [data], layout)
      )

controllersModule.controller('PlotsController', ['$scope', '$rootScope', '$log', 'GtfsService', '$filter', PlotsController])
