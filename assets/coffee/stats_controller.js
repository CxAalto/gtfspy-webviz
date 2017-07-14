class StatsController

  constructor: (@$scope, @$rootScope, @$log, @GtfsService) ->

    @$scope.$on("newdbselected", @clearstats)

    clearstats = () =>
      @$rootScope.appdata.stats = {}


    @$scope.load_stats = () =>
      @$log.debug "fetch route data"
      rs = @$rootScope
      promise = @GtfsService.fetch_stats()
      promise.then( (json)->
          stats = []
          for key, value of json
            el = {}
            el.key = key
            el.value = value
            stats.push(el)
          rs.appdata.stats = stats
        )



controllersModule.controller('StatsController', ['$scope', '$rootScope', '$log', 'GtfsService', StatsController])
