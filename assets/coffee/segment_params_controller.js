class SegmentParamsController

  constructor: (@$scope, @$rootScope, @$log, @GtfsService) ->

    @$scope.load_segment_data = () =>
      @$log.debug "fetch segment data"
      @$rootScope.$broadcast("loadsegmentdata")

    @$scope.toggle_segment_data = () =>
      @$log.debug "toggle segment data"
      @$rootScope.appdata.show_segment_data = !@$rootScope.appdata.show_segment_data
      @$rootScope.$broadcast("togglesegmentdata")

    @$scope.redraw_segments = () =>
      if @$rootScope.appdata.show_segment_data
        @$log.debug  "redraw segments"
        @$rootScope.$broadcast("redrawsegments")


controllersModule.controller('SegmentParamsController', ['$scope', '$rootScope', '$log', 'GtfsService', SegmentParamsController])
