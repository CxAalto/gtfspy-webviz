// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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



controllersModule.controller('StopParamsCtrl', ['$scope', '$rootScope', 'GtfsService', StopParamsCtrl]);
