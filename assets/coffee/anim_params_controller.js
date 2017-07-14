class AnimParamsCtrl

  constructor: (@$scope, @$rootScope, @$log, @GtfsService) ->

    @$scope.toggle_play = () =>
      anim_stopped_prev_state = @$rootScope.appdata.anim_stopped
      if not @$rootScope.appdata.anim_data_ready
        anim_stopped_next_state = true
      else
        anim_stopped_next_state = !anim_stopped_prev_state
      state_changed = (anim_stopped_next_state != anim_stopped_prev_state)
      @$rootScope.appdata.anim_stopped = anim_stopped_next_state
      if state_changed
        @$rootScope.$broadcast('play', {'play':!@$rootScope.appdata.anim_stopped})

    @$scope.load_anim_data = () =>
      @$rootScope.$broadcast("load_anim_data")

    @$scope.step_anim = () =>
      console.log "step!"
      @$rootScope.$broadcast('step_anim')

    @$scope.toggle_anim_visibility = () =>
      @$rootScope.appdata.anim_visible = !@$rootScope.appdata.anim_visible
      @$rootScope.$broadcast('animvisibility')



controllersModule.controller('AnimParamsCtrl', ['$scope', '$rootScope', '$log', 'GtfsService', AnimParamsCtrl])
