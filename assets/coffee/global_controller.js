class GlobalCtrl
  constructor: (@$log, @$scope) ->

    s = @$scope
    @$scope.appdata.toggleFooter = () =>
      # if same tab as before, make invisible
      # (i.e. hide to get more visible screen estate)
      s.appdata.show_footer = ! s.appdata.show_footer
      s.$broadcast("mapsizechanged")

controllersModule.controller('GlobalCtrl', ['$log', '$scope', GlobalCtrl])
