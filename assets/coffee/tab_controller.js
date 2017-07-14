/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */


class TabCtrl {
  constructor($log, $scope, $rootScope) {
    this.$log = $log;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$rootScope.appdata.tabToShow = "ANIMATION";

    this.$scope.toggleShow = newTabToShow => {
      // if same tab as before, make invisible
      // (i.e. hide to get more visible screen estate)
      if (newTabToShow === this.$rootScope.appdata.tabToShow) {
        this.$rootScope.appdata.tabToShow = "";
      } else {
        this.$rootScope.appdata.tabToShow = newTabToShow;
      }
      return this.$rootScope.$broadcast("mapsizechanged");
    };
  }
}



const mdtabclick = function() {
  const obj = {
    scope: false,
    restrict: 'AE',
    link(scope, element, attrs, controller) {
            return element.bind('click', e => scope.toggleShow(attrs.label));
          }
    };
  return obj;
};

controllersModule.directive('mdtabclick', mdtabclick);
controllersModule.controller('TabCtrl', ['$log', '$scope', "$rootScope", TabCtrl]);

