/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class GlobalCtrl {
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

controllersModule.controller('GlobalCtrl', ['$log', '$scope', GlobalCtrl]);
