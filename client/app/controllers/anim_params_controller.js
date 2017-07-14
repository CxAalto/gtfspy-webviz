import angular from 'angular';
import {CONTROLLERS_MODULE_NAME} from "../const";

const CONTROLLER_NAME = "AnimParamsCtrl";

class AnimParamsCtrl {

  constructor($scope, $rootScope, $log, GtfsService) {

    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.GtfsService = GtfsService;
    this.$scope.toggle_play = () => {
      let anim_stopped_next_state;
      const anim_stopped_prev_state = this.$rootScope.appdata.anim_stopped;
      if (!this.$rootScope.appdata.anim_data_ready) {
        anim_stopped_next_state = true;
      } else {
        anim_stopped_next_state = !anim_stopped_prev_state;
      }
      const state_changed = (anim_stopped_next_state !== anim_stopped_prev_state);
      this.$rootScope.appdata.anim_stopped = anim_stopped_next_state;
      if (state_changed) {
        return this.$rootScope.$broadcast('play', {'play':!this.$rootScope.appdata.anim_stopped});
      }
    };

    this.$scope.load_anim_data = () => {
      return this.$rootScope.$broadcast("load_anim_data");
    };

    this.$scope.step_anim = () => {
      if (this.$rootScope.appdata.anim_data_ready) {
        this.$rootScope.$broadcast('step_anim');
      };
    };

    this.$scope.toggle_anim_visibility = () => {
      this.$rootScope.appdata.anim_visible = !this.$rootScope.appdata.anim_visible;
      return this.$rootScope.$broadcast('animvisibility');
    };
  }
}


var controllersModule = angular.module(CONTROLLERS_MODULE_NAME);
controllersModule.controller(CONTROLLER_NAME, ['$scope', '$rootScope', '$log', 'GtfsService', AnimParamsCtrl]);
export default CONTROLLER_NAME;

