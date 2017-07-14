class SpreadingParamsCtrl

  constructor: (@$scope, @$rootScope, @$log, @GtfsService) ->

    @$scope.toggle_play = () =>
      spreading_stopped_prev_state = @$rootScope.appdata.spreading_stopped
      if not @$rootScope.appdata.spreading_data_ready
        spreading_stopped_next_state = true
      else
        spreading_stopped_next_state = !spreading_stopped_prev_state
      state_changed = (spreading_stopped_next_state != spreading_stopped_prev_state)
      @$rootScope.appdata.spreading_stopped = spreading_stopped_next_state
      if state_changed
        @$rootScope.$broadcast('play_spreading', {'play':!@$rootScope.appdata.spreading_stopped})

    @$scope.load_spreading_data = () =>
      @$rootScope.$broadcast("load_spreading_data")

    @$scope.step_spreading = () =>
      console.log "step!"
      @$rootScope.$broadcast('step_spreading')

    @$scope.toggle_spreading_visibility = () =>
      @$rootScope.appdata.spreading_visible = !@$rootScope.appdata.spreading_visible
      @$rootScope.$broadcast('spreadingvisibility')

controllersModule.controller('SpreadingParamsCtrl', ['$scope', '$rootScope', '$log', 'GtfsService', SpreadingParamsCtrl])
