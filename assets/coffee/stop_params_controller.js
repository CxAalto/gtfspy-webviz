class StopParamsCtrl

  constructor: (@$scope, @$rootScope, @GtfsService) ->

    @$scope.load_stop_data = () =>
      @$rootScope.$broadcast("loadstopdata")

    @$scope.show_stop_data = () =>
      @$rootScope.appdata.show_stop_data = !@$rootScope.appdata.show_stop_data
      @$rootScope.$broadcast("togglestopdata")

    @$scope.colorStopsToggled = () =>
      if @$rootScope.appdata.show_stop_data
        @$rootScope.$broadcast("redrawstops")



controllersModule.controller('StopParamsCtrl', ['$scope', '$rootScope', 'GtfsService', StopParamsCtrl])
