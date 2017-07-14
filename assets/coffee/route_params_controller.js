/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class RouteParamsController {

  constructor($scope, $rootScope, $log, GtfsService) {

    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.GtfsService = GtfsService;
    this.$scope.load_route_data = () => {
      this.$log.debug("fetch route data");
      return this.$rootScope.$broadcast("loadroutedata");
    };

    this.$scope.toggle_route_data = () => {
      this.$log.debug("toggle route data");
      this.$rootScope.appdata.show_route_data = !this.$rootScope.appdata.show_route_data;
      return this.$rootScope.$broadcast("toggleroutedata");
    };

    this.$scope.redraw_routes = () => {
      return this.$rootScope.$broadcast("redrawroutes");
    };
  }
}


controllersModule.controller('RouteParamsController', ['$scope', '$rootScope', '$log', 'GtfsService', RouteParamsController]);
