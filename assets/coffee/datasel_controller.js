class DataSelectionCtrl
  constructor: (@$scope, @GtfsService, @$rootScope) ->

    @$scope.dbfnameupdate = () =>
      @$rootScope.appdata.dbfname = @$scope.selected_dbfname
      @$rootScope.appdata.show_footer = true
      @$rootScope.appdata.show_data_select = false
      @GtfsService.fetch_stats()

controllersModule.controller('DataSelectionCtrl', ['$scope', 'GtfsService', '$rootScope', DataSelectionCtrl])
