import angular from 'angular';
import {CONTROLLERS_MODULE_NAME} from "../const";

const CONTROLLER_NAME = "GlobalCtrl";

export class GlobalCtrl {

  constructor($log, $scope) {

    this.$log = $log;
    this.$scope = $scope;
    const s = this.$scope;
    this.$scope.appdata.toggleFooter = () => {
      // if same tab as before, make invisible
      // (i.e. hide to get more visible screen estate)
      s.appdata.show_footer = !s.appdata.show_footer;
      return s.$broadcast("mapsizechanged");
    };
  }
}


var controllersModule = angular.module(CONTROLLERS_MODULE_NAME);
controllersModule.controller(CONTROLLER_NAME, ['$log', '$scope', GlobalCtrl]);

export default CONTROLLER_NAME;