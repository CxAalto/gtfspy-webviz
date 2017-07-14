import angular from 'angular';
import { CONTROLLERS_MODULE_NAME } from './../const';

const CONTROLLER_NAME = "SegmentParamsController";

class SegmentParamsController {

  constructor($scope, $rootScope, $log, GtfsService) {

    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.GtfsService = GtfsService;
    this.$scope.load_segment_data = () => {
      this.$log.debug("fetch segment data");
      return this.$rootScope.$broadcast("loadsegmentdata");
    };

    this.$scope.toggle_segment_data = () => {
      this.$log.debug("toggle segment data");
      this.$rootScope.appdata.show_segment_data = !this.$rootScope.appdata.show_segment_data;
      return this.$rootScope.$broadcast("togglesegmentdata");
    };

    this.$scope.redraw_segments = () => {
      if (this.$rootScope.appdata.show_segment_data) {
        this.$log.debug("redraw segments");
        return this.$rootScope.$broadcast("redrawsegments");
      }
    };
  }
}

var controllersModule = angular.module(CONTROLLERS_MODULE_NAME);
controllersModule.controller(CONTROLLER_NAME, ['$scope', '$rootScope', '$log', 'GtfsService', SegmentParamsController]);
export default CONTROLLER_NAME;
