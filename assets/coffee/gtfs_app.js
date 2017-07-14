
dependencies = [
    'gtfsApp.controllers',
    'gtfsApp.services',
    'ngMaterial',
    'ngMessages',
    'material.svgAssetsCache'
]

@app = angular.module('gtfsApp', dependencies)

@controllersModule = angular.module('gtfsApp.controllers', [])
@servicesModule = angular.module('gtfsApp.services', [])

@app.run(['GtfsService',
         (GtfsService) ->
            GtfsService.fetch_databases()
        ])

@app.directive('stringtonumber', () ->
    return {
        require: 'ngModel',
        link: (scope, element, attrs, ngModel) ->
            ngModel.$parsers.push( (value) ->
                return parseFloat(value)
            )
            ngModel.$formatters.push( (value) ->
                return '' + value
            )
    }
)

