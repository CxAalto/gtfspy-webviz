// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import angular from 'angular';
import {CONTROLLERS_MODULE_NAME} from "../const";

const CONTROLLER_NAME = "StopParamsCtrl";


class StopParamsCtrl {

  constructor($scope, $rootScope, GtfsService) {

    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.GtfsService = GtfsService;
    this.$scope.load_stop_data = () => {
      return this.$rootScope.$broadcast("loadstopdata");
    };

    this.$scope.show_stop_data = () => {
      this.$rootScope.appdata.show_stop_data = !this.$rootScope.appdata.show_stop_data;
      return this.$rootScope.$broadcast("togglestopdata");
    };

    this.$scope.colorStopsToggled = () => {
      if (this.$rootScope.appdata.show_stop_data) {
        return this.$rootScope.$broadcast("redrawstops");
      }
    };
  }
}


var controllersModule = angular.module(CONTROLLERS_MODULE_NAME);
controllersModule.controller(CONTROLLER_NAME, ['$scope', '$rootScope', 'GtfsService', StopParamsCtrl]);
export default CONTROLLER_NAME;
