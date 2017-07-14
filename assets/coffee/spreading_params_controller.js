// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class SpreadingParamsCtrl {

  constructor($scope, $rootScope, $log, GtfsService) {

    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.GtfsService = GtfsService;
    this.$scope.toggle_play = () => {
      let spreading_stopped_next_state;
      const spreading_stopped_prev_state = this.$rootScope.appdata.spreading_stopped;
      if (!this.$rootScope.appdata.spreading_data_ready) {
        spreading_stopped_next_state = true;
      } else {
        spreading_stopped_next_state = !spreading_stopped_prev_state;
      }
      const state_changed = (spreading_stopped_next_state !== spreading_stopped_prev_state);
      this.$rootScope.appdata.spreading_stopped = spreading_stopped_next_state;
      if (state_changed) {
        return this.$rootScope.$broadcast('play_spreading', {'play':!this.$rootScope.appdata.spreading_stopped});
      }
    };

    this.$scope.load_spreading_data = () => {
      return this.$rootScope.$broadcast("load_spreading_data");
    };

    this.$scope.step_spreading = () => {
      console.log("step!");
      return this.$rootScope.$broadcast('step_spreading');
    };

    this.$scope.toggle_spreading_visibility = () => {
      this.$rootScope.appdata.spreading_visible = !this.$rootScope.appdata.spreading_visible;
      return this.$rootScope.$broadcast('spreadingvisibility');
    };
  }
}

controllersModule.controller('SpreadingParamsCtrl', ['$scope', '$rootScope', '$log', 'GtfsService', SpreadingParamsCtrl]);
