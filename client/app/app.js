import angular from 'angular';
import ngMaterial from "angular-material";
import ngMessages from "angular-messages";
import svgAssetsCache from "svg-assets-cache";
import ngAnimate from "angular-animate";
import ngAria from "angular-aria";

import 'bootstrap/dist/css/bootstrap.css';
require("../lib/material-design-lite/material.min.css");
require("../style/gtfs.css");
require("../style/slider.css");

// Do some initialization before running any of the other scripts, hackish... but works
// Perhaps the controllers should be added to the app.controllers -module only here
import init from "./init";
import {CONTROLLERS_MODULE_NAME, SERVICES_MODULE_NAME, APP_MODULE_NAME} from "./const";
import globalCtrl from './controllers/global_controller';
import gtfsService from "./services/gtfs_service";
import initParams from "./init_data"

// Required for webpack to create a proper build
import tabCtrl from './controllers/tab_controller';
import mapCtrl from './controllers/map_controller';
import segmentParamsCtrl from './controllers/segment_params_controller';
import routeParamsCtrl from './controllers/route_params_controller';
import animParamsCtrl from './controllers/anim_params_controller';
import spreadingParamsCtrl from './controllers/spreading_params_controller';
import stopParamsCtrl from './controllers/stop_params_controller';
import statsCtrl from './controllers/stats_controller';
import plotsCtrl from './controllers/plots_controller';
import dataselCtrl from "./controllers/datasel_controller";

const dependencies = [
    CONTROLLERS_MODULE_NAME,
    SERVICES_MODULE_NAME,
    ngMaterial,
    ngMessages,
    svgAssetsCache
];



let app = () => {
  return {
    template: require('./app.html'),
    controller: globalCtrl,
    controllerAs: 'app'
  }
};

// var servicesModule = angular.module(SERVICES_MODULE_NAME, []);
app = angular.module(APP_MODULE_NAME, dependencies).directive('app', app);

app.run([gtfsService, "$rootScope", (GtfsService, $rootScope) => {
  $rootScope.appdata = initParams;
  GtfsService.fetch_databases();
}]);

app.directive('stringtonumber', () =>
    ({
        require: 'ngModel',
        link(scope, element, attrs, ngModel) {
            ngModel.$parsers.push( value => parseFloat(value));
            return ngModel.$formatters.push( value => `${value}`);
        }
    })
);

export default APP_MODULE_NAME;