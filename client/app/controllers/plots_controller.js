// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import angular from 'angular';
import {CONTROLLERS_MODULE_NAME} from "../const";

const CONTROLLER_NAME = "PlotsController";

class PlotsController {

  constructor($scope, $rootScope, $log, GtfsService, $filter) {

    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.GtfsService = GtfsService;
    this.$filter = $filter;
    this.$scope.load_plots = () => {
      this.$log.debug("fetching plots data");
      const rs = this.$rootScope;
      const promise = this.GtfsService.get_trips_per_day();
      const tc = this;
      return promise.then( function(json){
        // datefilter = tc.$filter('date')
        // dbfname = tc.$rootScope.appdata.dbfname
        // tz = tc.$rootScope.appdata.timezones[dbfname]
        // dates = (datefilter(date_ut*1000, "yyyy-MM-dd", tz) for date_ut in json['day_start_uts'])

        let np;
        const data = {
          x : json['dates'],
          y : json['trip_counts'],
          name : "Trips per day",
          type: 'bar'
        };

        const layout = {
          xaxis: {
            title: 'Day start'
          },
          yaxis: {
            title: 'Number of trips per day'
          },
          title: "Trips per day"
        };

        debugger;
        return np = Plotly.newPlot('tripsperdayplot', [data], layout);
      });
    };
  }
}

var controllersModule = angular.module(CONTROLLERS_MODULE_NAME);
controllersModule.controller(CONTROLLER_NAME, ['$scope', '$rootScope', '$log', 'GtfsService', '$filter', PlotsController]);
export default CONTROLLER_NAME;

