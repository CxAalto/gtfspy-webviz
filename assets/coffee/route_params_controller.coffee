class RouteParamsController

  constructor: (@$scope, @$rootScope, @$log, @GtfsService) ->

    @$scope.load_route_data = () =>
      @$log.debug "fetch route data"
      @$rootScope.$broadcast("loadroutedata")

    @$scope.toggle_route_data = () =>
      @$log.debug "toggle route data"
      @$rootScope.appdata.show_route_data = !@$rootScope.appdata.show_route_data
      @$rootScope.$broadcast("toggleroutedata")

    @$scope.redraw_routes = () =>
      @$rootScope.$broadcast("redrawroutes")


controllersModule.controller('RouteParamsController', ['$scope', '$rootScope', '$log', 'GtfsService', RouteParamsController])
