// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import angular from 'angular';
import {CONTROLLERS_MODULE_NAME} from "../const";

const CONTROLLER_NAME = "StatsController";


class StatsController {

  constructor($scope, $rootScope, $log, GtfsService) {

    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.GtfsService = GtfsService;
    this.$scope.$on("newdbselected", this.clearstats);

    const clearstats = () => {
      return this.$rootScope.appdata.stats = {};
    };


    this.$scope.load_stats = () => {
      this.$log.debug("fetch route data");
      const rs = this.$rootScope;
      const promise = this.GtfsService.fetch_stats();
      return promise.then( function(json){
          const stats = [];
          for (let key in json) {
            const value = json[key];
            const el = {};
            el.key = key;
            el.value = value;
            stats.push(el);
          }
          return rs.appdata.stats = stats;
        });
    };
  }
}


var controllersModule = angular.module(CONTROLLERS_MODULE_NAME);
controllersModule.controller(CONTROLLER_NAME, ['$scope', '$rootScope', '$log', 'GtfsService', StatsController]);
export default CONTROLLER_NAME;