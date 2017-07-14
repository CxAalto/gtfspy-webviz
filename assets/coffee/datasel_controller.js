/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class DataSelectionCtrl {
  constructor($scope, GtfsService, $rootScope) {

    this.$scope = $scope;
    this.GtfsService = GtfsService;
    this.$rootScope = $rootScope;
    this.$scope.dbfnameupdate = () => {
      this.$rootScope.appdata.dbfname = this.$scope.selected_dbfname;
      this.$rootScope.appdata.show_footer = true;
      this.$rootScope.appdata.show_data_select = false;
      return this.GtfsService.fetch_stats();
    };
  }
}

controllersModule.controller('DataSelectionCtrl', ['$scope', 'GtfsService', '$rootScope', DataSelectionCtrl]);
