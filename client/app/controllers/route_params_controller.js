// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import angular from 'angular';
import {CONTROLLERS_MODULE_NAME} from "../const";

const CONTROLLER_NAME = "RouteParamsController";


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

var controllersModule = angular.module(CONTROLLERS_MODULE_NAME);
controllersModule.controller(CONTROLLER_NAME, ['$scope', '$rootScope', '$log', 'GtfsService', RouteParamsController]);
export default CONTROLLER_NAME;

