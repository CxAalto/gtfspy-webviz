import angular from 'angular';
import {SERVICES_MODULE_NAME} from "../const";

class GtfsService {

  constructor($log, $http, $q, $rootScope, $location) {
    let needle;
    this.fetch_databases = this.fetch_databases.bind(this);
    this.fetch_stats = this.fetch_stats.bind(this);
    this.get_anim_trips = this.get_anim_trips.bind(this);
    this.$log = $log;
    this.$http = $http;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$location = $location;
    this.cache = {};
    // path prefix:
    this.$log.debug(`Running on: ${this.$location.host()}`);
    if ((needle = this.$location.host(), ["localhost", "127.0.0.1"].includes(needle))) {
      this.apiEndPoint = "http://127.0.0.1:5000";
    } else {
      // i.e. if on the production server:
      this.apiEndPoint = "/webviz/api";
    }
  }

  fetch_databases() {
    this.$log.debug("fetching list of databases, and timezones");
    const deferred = this.$q.defer();
    // get list of GTFS databases

    var url = this.apiEndPoint + "/databases";
    this.$http.get(url).then((response) => {
      var json = response.data;
      this.$rootScope.appdata.dbfnames = json['dbfnames'];
      this.$rootScope.appdata.timezones = json['timezones'];
      this.$log.debug("fetched list of databases and timezones");
      return deferred.resolve();
    }, (response) => {
      deferred.reject()
    });
    return deferred.promise;
  }

  fetch_stats() {
    const {dbfname} = this.$rootScope.appdata;
    this.$log.debug(`fetching stats for ${dbfname}`);
    const deferred = this.$q.defer();
    this.$http.get(this.apiEndPoint + "/stats?dbfname=" + dbfname)
      .then(
        (response) => {
          var json = response.data;
          deferred.resolve(json);
          this.$log.debug(`fetched stats for${dbfname}`);
          // set start, end and center of time span:
          this.$rootScope.appdata.data_start_min = Number(json['start_time_ut']);
          this.$rootScope.appdata.data_start_max = Number(json['end_time_ut']);
          this.$rootScope.appdata.data_start = Number(json['start_time_ut']) + ((24 + 8) * 3600);
          if (this.$rootScope.appdata.data_start_max < this.$rootScope.appdata.data_start) {
              alert('Only one day long data set?');
              this.$rootScope.appdata.data_start -= 24 * 3600;
          }
          // set map bounds according to LatLngBounds format
          this.$rootScope.appdata.data_map_bounds = [[json['lat_min'], json['lon_min']], [json['lat_max'], json['lon_max']]];
          this.$rootScope.$broadcast('newdbselected');
          this.$rootScope.appdata.data_loadable = true;
        },
        (response) => {
          deferred.reject()
        });
    return deferred.promise;
  }

  get_anim_trips() {
    this.$log.debug("fetching animation data");

    // get all (parts) of trips taking place between start_time and end_time
    const {dbfname} = this.$rootScope.appdata;
    this.$rootScope.appdata.anim_data_ready = false;
    this.$rootScope.appdata.anim_stopped = true;
    const start_time = Number(this.$rootScope.appdata.data_start);
    const end_time = start_time + Number(this.$rootScope.appdata.duration);
    const {use_shapes} = this.$rootScope.appdata;
    this.$rootScope.appdata.sim_time_min = start_time;
    this.$rootScope.appdata.sim_time = start_time;
    this.$rootScope.appdata.sim_time_max = end_time;

    const cstr = `gt_${start_time}_${end_time}_${dbfname}_${use_shapes}`;

    const deferred = this.$q.defer();
    if (this.cache[cstr]) {
      // simple cache
      this.$log.debug("fetched animation data");
      debugger;
      deferred.resolve(this.cache[cstr]);
    } else {
      const thisservice = this; // weird scoping of "this" in the below @$http.get...
      let shapestr = 0;
      if (use_shapes) {
        shapestr = 1;
      }

      var url = this.apiEndPoint + "/trajectories?tstart=" + start_time + "&tend=" + end_time +
        "&dbfname=" + dbfname + "&use_shapes=" + shapestr;
      this.$http.get(url)
        .then(
          (response) => {
            const trip_data = response.data['trips'];
            thisservice.$log.debug("fetched animation data");
            thisservice.cache[cstr] = trip_data;
            deferred.resolve(trip_data);
            //##### thisservice.$rootScope.$broadcast('newgtfsdata')
          },
          (response) => {
            deferred.reject();
          }
        );
    }
    return deferred.promise;
  }

  fetch_stop_data() {

    const {dbfname} = this.$rootScope.appdata;
    const start_time = Number(this.$rootScope.appdata.data_start);
    const end_time = start_time + Number(this.$rootScope.appdata.duration);
    const cstr = `stopdata_${start_time}_${end_time}_${dbfname}`;

    const deferred = this.$q.defer();
    if (this.cache[cstr]) {
      // simple cache
      // @$rootScope.appdata.stop_data = @cache[cstr]
      deferred.resolve(this.cache[cstr]);
      this.$rootScope.$broadcast('newstopdata');
      return deferred.promise()
    }

    const thisservice = this; // weird scoping of "this" in the below @$http.get...
    const query = `/stopcounts?tstart=${start_time}&tend=${end_time}&dbfname=${dbfname}`;
    this.$http.get(this.apiEndPoint + query)
      .then(
        (response) => {
          var stop_data = response.data;
          thisservice.cache[cstr] = stop_data;
          return deferred.resolve(stop_data);
        },
        (response) => {
          deferred.reject()
        });
    return deferred.promise;
  }

  fetch_segment_data() {
    this.$log.debug("fetching segment data");


    const {dbfname} = this.$rootScope.appdata;
    const start_time = Number(this.$rootScope.appdata.data_start);
    const end_time = start_time + Number(this.$rootScope.appdata.duration);
    let shapestr = 0;
    const {use_shapes} = this.$rootScope.appdata;
    if (use_shapes) {
      shapestr = 1;
    }
    const cstr = `segmentdata_${start_time}_${end_time}_${dbfname}_${shapestr}`;

    const deferred = this.$q.defer();
    if (this.cache[cstr]) {
      // simple cache
      this.$rootScope.appdata.segment_data = this.cache[cstr];
      deferred.resolve(this.cache[cstr]);
      return deferred.promise;
    }


    const thisservice = this; // weird scoping of "this" in the below @$http.get...
    const query = `/linkcounts?tstart=${start_time}&tend=${end_time}&dbfname=${dbfname}&use_shapes=${shapestr}`;
    this.$http.get(this.apiEndPoint + query)
      .then(
        (response) => {
          var segment_data = response.data;
          deferred.resolve(segment_data);
          return thisservice.cache[cstr] = segment_data;
        },
        (response) => {
          deferred.reject()
        });
    return deferred.promise;

  }


  fetch_route_data() {

    this.$log.debug("fetching route data");
    const {dbfname} = this.$rootScope.appdata;

    let shapestr = 0;
    const {use_shapes} = this.$rootScope.appdata;
    if (use_shapes) {
      shapestr = 1;
    }
    const cstr = `getroutes_${dbfname}_${shapestr}`;

    const deferred = this.$q.defer();
    if (this.cache[cstr]) {
      // simple cache
      this.$log.debug("fetched route data");
      deferred.resolve(this.cache[cstr]);
      return deferred.promise
    }


    const thisservice = this; // weird scoping of "this" in the below @$http.get...
    const query = `/routes?&dbfname=${dbfname}&use_shapes=${shapestr}`;
    this.$http.get(this.apiEndPoint + query)
      .then(
        (response) => {
          var route_data = response.data;
          thisservice.$log.debug("fetched route data");
          thisservice.cache[cstr] = route_data;
          return deferred.resolve(route_data);
        },
        (response) => {
          deferred.reject();
        });

    return deferred.promise;
  }

  get_trips_per_day()  {
    const {dbfname} = this.$rootScope.appdata;
    this.$log.debug("fetching tripsperdaydata");
    const cstr = `tripsperday_${dbfname}`;

    const deferred = this.$q.defer();

    if (this.cache[cstr]) {
      // simple cache
      const data = this.cache[cstr];
      deferred.resolve(data);
      this.$log.debug("fetched route data");
      return deferred.promise;
    }

    const query = `/tripsperday?dbfname=${dbfname}`;
    const thisservice = this;
    this.$http.get(this.apiEndPoint + query)
      .then(
        (response) => {
          var statsdata = response.data;
          // ( @ corresponds to a http request object here now)
          thisservice.$log.debug("fetched tripsperday data");
          thisservice.cache[cstr] = statsdata;
          return deferred.resolve(statsdata);
        },
        (response) => {
          deferred.reject()
        }
      );
    return deferred.promise;

  }


  get_spreading_trips() {
    this.$log.debug("fetching spreading data");
    // get all (parts) of trips taking place between start_time and end_time
    const {dbfname} = this.$rootScope.appdata;
    this.$rootScope.appdata.spreading_data_ready = false;
    this.$rootScope.appdata.spreading_stopped = true;
    const start_time = Number(this.$rootScope.appdata.data_start);
    const end_time = start_time + Number(this.$rootScope.appdata.duration);
    const {use_shapes} = this.$rootScope.appdata;
    this.$rootScope.appdata.spreading_sim_time_min = start_time;
    this.$rootScope.appdata.spreading_sim_time = start_time;
    this.$rootScope.appdata.spreading_sim_time_max = end_time;

    const lat = this.$rootScope.appdata.spreading_lat;
    const lon = this.$rootScope.appdata.spreading_lon;

    // get time-dependent 'spreading' trips starting between start_time and end_time
    const deferred = this.$q.defer();
    var url = this.apiEndPoint + "/spreading?tstart=" + start_time + "&tend=" + end_time + "&lat=" + lat + "&lon=" + lon + "&dbfname=" + dbfname
    this.$http.get(url)
      .then(
        (response) => {
          var json = response.data;
          const trip_data = json['trips'];
          console.log(trip_data);
          return deferred.resolve(trip_data);
        },
        (response) => {
          deferred.reject();
      });

    return deferred.promise;
  }
}


const SERVICE_NAME = "GtfsService";
var servicesModule = angular.module(SERVICES_MODULE_NAME);
servicesModule.service(SERVICE_NAME, ['$log', '$http', '$q', '$rootScope', '$location', GtfsService]);


export default SERVICE_NAME;

