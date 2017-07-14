

class TabCtrl
  constructor: (@$log, @$scope, @$rootScope) ->
    @$rootScope.appdata.tabToShow = "ANIMATION"

    @$scope.toggleShow = (newTabToShow) =>
      # if same tab as before, make invisible
      # (i.e. hide to get more visible screen estate)
      if newTabToShow == @$rootScope.appdata.tabToShow
        @$rootScope.appdata.tabToShow = ""
      else
        @$rootScope.appdata.tabToShow = newTabToShow
      @$rootScope.$broadcast("mapsizechanged")



mdtabclick = () ->
  obj = {
    scope: false,
    restrict: 'AE',
    link: (scope, element, attrs, controller) ->
            element.bind('click', (e) ->
              scope.toggleShow(attrs.label)
            )
    }
  return obj

controllersModule.directive('mdtabclick', mdtabclick)
controllersModule.controller('TabCtrl', ['$log', '$scope', "$rootScope", TabCtrl])

