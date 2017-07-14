/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const dependencies = [
    'gtfsApp.controllers',
    'gtfsApp.services',
    'ngMaterial',
    'ngMessages',
    'material.svgAssetsCache'
];

this.app = angular.module('gtfsApp', dependencies);

this.controllersModule = angular.module('gtfsApp.controllers', []);
this.servicesModule = angular.module('gtfsApp.services', []);

this.app.run(['GtfsService',
         GtfsService => GtfsService.fetch_databases()
        ]);

this.app.directive('stringtonumber', () =>
    ({
        require: 'ngModel',
        link(scope, element, attrs, ngModel) {
            ngModel.$parsers.push( value => parseFloat(value));
            return ngModel.$formatters.push( value => `${value}`);
        }
    })
);

