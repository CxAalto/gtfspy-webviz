import angular from 'angular';
require('../../../node_modules/leaflet/dist/leaflet-src.js');
require('../../../node_modules/leaflet/dist/leaflet.css');
require("../utils/trip");
import {CONTROLLERS_MODULE_NAME} from "../const";

import ColorMap from "../utils/colormap";



const CONTROLLER_NAME = "MapCtrl";

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

class MapCtrl {

    constructor($log, $scope, $rootScope, $timeout, GtfsService) {
        this.set_spreading_latlng = this.set_spreading_latlng.bind(this);
        this.add_spreading_origin = this.add_spreading_origin.bind(this);
        this.clear_layers = this.clear_layers.bind(this);
        this.resize_map = this.resize_map.bind(this);
        this.set_map_bounds = this.set_map_bounds.bind(this);
        this.toggle_routes_layer = this.toggle_routes_layer.bind(this);
        this.toggle_anim_layer = this.toggle_anim_layer.bind(this);
        this.toggle_spreading_layer = this.toggle_spreading_layer.bind(this);
        this.toggle_stop_layer = this.toggle_stop_layer.bind(this);
        this.toggle_segment_layer = this.toggle_segment_layer.bind(this);
        this.play = this.play.bind(this);
        this.play_spreading = this.play_spreading.bind(this);
        this.load_and_init_anim = this.load_and_init_anim.bind(this);
        this.load_and_init_spreading = this.load_and_init_spreading.bind(this);
        this.load_and_draw_stops = this.load_and_draw_stops.bind(this);
        this.load_and_draw_segments = this.load_and_draw_segments.bind(this);
        this.load_and_draw_routes = this.load_and_draw_routes.bind(this);
        this.init_gtfs_anim = this.init_gtfs_anim.bind(this);
        this.animate_gtfs_step = this.animate_gtfs_step.bind(this);
        this.draw_stops = this.draw_stops.bind(this);
        this.draw_segments = this.draw_segments.bind(this);
        this.draw_routes = this.draw_routes.bind(this);
        this.init_gtfs_spreading = this.init_gtfs_spreading.bind(this);
        this.spreading_step = this.spreading_step.bind(this);
        this.$log = $log;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.GtfsService = GtfsService;
        const cartoDBdark = L.tileLayer(
          'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'}
        );

        const cartoDBlight = L.tileLayer(
          'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'}
        );

        this.map = L.map('map',
          {
            zoom: 2,
            center: [20, 0],
            layers: [cartoDBlight],
            zoomControl: false,
            attributionControl: true
          }
        );
        const zoomControl = L.control.zoom({position: "topleft"}).addTo(this.map);
        L.control.scale({position: "bottomright"}).addTo(this.map);

        const baseMaps = {"light": cartoDBlight, "dark":cartoDBdark};
        // L.control.attribution({position: 'bottomright'}).addTo(@map)

        L.control.layers(baseMaps, []).addTo(this.map);
        this.$scope.$on('play', this.play);
        this.$scope.$on('play_spreading', this.play_spreading);
        this.$scope.$on('newdbselected', this.set_map_bounds);
        this.$scope.$on('newdbselected', this.clear_layers);
        this.$scope.$on('redrawstops', this.draw_stops);
        this.$scope.$on('redrawsegments', this.draw_segments);
        this.$scope.$on('redrawroutes', this.draw_routes);
        this.$scope.$on('animvisibility', this.toggle_anim_layer);
        this.$scope.$on('spreadingvisibility', this.toggle_spreading_layer);
        this.$scope.$on('step_anim', this.animate_gtfs_step);
        this.$scope.$on('step_spreading', this.spreading_step);
        this.$scope.$on('togglestopdata', this.toggle_stop_layer);
        this.$scope.$on('togglesegmentdata', this.toggle_segment_layer);
        this.$scope.$on('toggleroutedata', this.toggle_routes_layer);
        this.$scope.$on('mapsizechanged', this.resize_map);
        this.$scope.$on('load_anim_data', this.load_and_init_anim);
        this.$scope.$on('load_spreading_data', this.load_and_init_spreading);
        this.$scope.$on('loadstopdata', this.load_and_draw_stops);
        this.$scope.$on('loadsegmentdata', this.load_and_draw_segments);
        this.$scope.$on('loadroutedata', this.load_and_draw_routes);

        // hack: timeout for resizing the map after the page has loaded
        this.$timeout(this.map._onResize, 2000);

        // these colors are taken from http://colorbrewer2.org/
        this.categoryColors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];
        this.triptypenames = window.Trip.getTypeNames();

        // layers:
        this.animationLayer = L.layerGroup([]);
        this.stoplayer = L.layerGroup([]);
        this.segmentlayer = L.layerGroup([]);
        this.routelayer = L.layerGroup([]);
        this.spreadinglayer = L.layerGroup([]);
        this.spreadingoriginlayer = L.layerGroup([]);

        this.map.on('click', this.set_spreading_latlng);
      }

    set_spreading_latlng(e) {
      console.log(e);
      if (this.$rootScope.appdata.tabToShow === "SPREADING") {
        this.$log.debug("Setting spreading origin to:" , e.latlng);
        this.$rootScope.appdata.spreading_lat = e.latlng.lat;
        this.$rootScope.appdata.spreading_lon = e.latlng.lng;
        // force rootScope update cycle, as leaflet mouse-events are not tracked (?)
        this.$rootScope.$apply();
        this.add_spreading_origin();
      }
    }

    add_spreading_origin() {
      const lat = this.$rootScope.appdata.spreading_lat;
      const lon = this.$rootScope.appdata.spreading_lon;
      const circle = L.circleMarker([lat, lon], {
        stroke: false,
        fillColor: "orange",
        fillOpacity: 1.0,
        title: "Spreading origin"
      });
      circle.setRadius(10).bindTooltip("Spreading origin");
      if (this.map.hasLayer(this.spreadingoriginlayer)) {
        this.map.removeLayer(this.spreadingoriginlayer);
      }
      this.spreadingoriginlayer = circle;
      this.toggle_spreading_layer();
    }
      // updates visibility of the spreadingorigin as necessary

    clear_layers(event) {
      return (() => {
        const result = [];
        for (let layer of [this.animationLayer, this.stoplayer, this.segmentlayer,
                    this.routelayer, this.spreadinglayer, this.spreadingoriginlayer]) {
          if (this.map.hasLayer(layer)) {
            this.map.removeLayer(layer);
          }
          result.push(layer = L.layerGroup([]));
        }
        return result;
      })();
    }

    resize_map(event) {
      return this.map.invalidateSize();
    }

    set_map_bounds(event) {
      return this.map.fitBounds(this.$rootScope.appdata.data_map_bounds);
    }

    toggle_routes_layer(event) {
      console.log('toggling!');
      if (this.$rootScope.appdata.show_route_data) {
        if (!this.map.hasLayer(this.routelayer)) {
          return this.routelayer.addTo(this.map);
        }
      } else {
        if (this.map.hasLayer(this.routelayer)) {
          return this.map.removeLayer(this.routelayer);
        }
      }
    }

    toggle_anim_layer(event) {
      if (this.$rootScope.appdata.anim_visible) {
        if (!this.map.hasLayer(this.animationLayer)) {
          return this.animationLayer.addTo(this.map);
        }
      } else {
        if (this.map.hasLayer(this.animationLayer)) {
          return this.map.removeLayer(this.animationLayer);
        }
      }
    }

    toggle_spreading_layer(event) {
      if (this.$rootScope.appdata.spreading_visible) {
        if (!this.map.hasLayer(this.spreadinglayer)) {
          console.log(this.spreadinglayer);
          this.spreadinglayer.addTo(this.map);
        }
        if (!this.map.hasLayer(this.spreadingoriginlayer)) {
          return this.spreadingoriginlayer.addTo(this.map);
        }
      } else {
        if (this.map.hasLayer(this.spreadinglayer)) {
          this.map.removeLayer(this.spreadinglayer);
        }
        if (this.map.hasLayer(this.spreadingoriginlayer)) {
          return this.map.removeLayer(this.spreadingoriginlayer);
        }
      }
    }

    toggle_stop_layer(event) {
      if (this.$rootScope.appdata.show_stop_data) {
        if (!this.map.hasLayer(this.stoplayer)) {
          return this.stoplayer.addTo(this.map);
        }
      } else {
        if (this.map.hasLayer(this.stoplayer)) {
          return this.map.removeLayer(this.stoplayer);
        }
      }
    }

    toggle_segment_layer(event) {
      if (this.$rootScope.appdata.show_segment_data) {
        if (!this.map.hasLayer(this.segmentlayer)) {
          return this.segmentlayer.addTo(this.map);
        }
      } else {
        if (this.map.hasLayer(this.segmentlayer)) {
          return this.map.removeLayer(this.segmentlayer);
        }
      }
    }

    play(event, args) {
      if (args.play) {
        this.animate_gtfs_step(false);
      }
    }

    play_spreading(event, args) {
      if (args.play) {
        this.spreading_step(false);
      }
    }

    load_and_init_anim() {
      this.$rootScope.appdata.loading = true;
      const promise = this.GtfsService.get_anim_trips();
      const t = this;
      return promise.then( (data) => {
        t.$rootScope.appdata.anim_data = data;
        t.init_gtfs_anim();
        t.$rootScope.appdata.loading = false;
      }, (data) => {
        t.$rootScope.appdata.loading = false;
      });
    }

    load_and_init_spreading() {
      this.$rootScope.appdata.loading = true;
      const promise = this.GtfsService.get_spreading_trips();
      const t = this;
      return promise.then(function(data) {
        t.$rootScope.appdata.spreading_data = data;
        t.init_gtfs_spreading();
        return t.$rootScope.appdata.loading = false;
      });
    }

    load_and_draw_stops() {
      this.$rootScope.appdata.loading = true;
      const promise = this.GtfsService.fetch_stop_data();
      const t = this;
      return promise.then(
        (data) => {
          t.$rootScope.appdata.stop_data = data;
          t.draw_stops();
          return t.$rootScope.appdata.loading = false;
        },
        (data) => {
          t.$rootScope.appdata.loading = false;
          alert("Stop data could not be loaded");
        }
      );
    }

    load_and_draw_segments() {
      this.$rootScope.appdata.loading = true;
      const promise = this.GtfsService.fetch_segment_data();
      const t = this;
      return promise.then(
        (data) => {
          t.$rootScope.appdata.segment_data = data;
          t.draw_segments();
          t.$rootScope.appdata.loading = false;
        }, (data) => {
          t.$rootScope.appdata.loading = false;
          alert("Segment data could not be loaded");
        });
    }

    load_and_draw_routes() {
      this.$rootScope.appdata.loading = true;
      const promise = this.GtfsService.fetch_route_data();
      const t = this;
      return promise.then(
        (data) => {
          t.$rootScope.appdata.route_data = data;
          t.draw_routes();
          t.$rootScope.appdata.loading = false;
        }, (data) => {
          t.$rootScope.appdata.loading = false;
          alert("Route data could not be loaded");
        } );
    }


    init_gtfs_anim() {
      this.$log.debug("initialising animation");
      if (this.map.hasLayer(this.animationLayer)) {
        this.map.removeLayer(this.animationLayer);
      }
      this.animationLayer = L.layerGroup([]);
      this.gtfsanimdata = null;

      const trip_markers = [];
      const trip_tails = [];
      const trip_layers = [];
      const trips = [];

      const trip_data = this.$rootScope.appdata.anim_data;
      for (let i = 0, end = trip_data.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
        const trip = new Trip(trip_data[i]);
        const circle = L.circleMarker([0, 0], {
            stroke: false,
            fillColor: trip.getColorByType(),
            fillOpacity: 1.0,
            title: "unselected"
        });

        // remove vehicle from sight if it is not visible
        circle.setRadius(4).bindTooltip(trip.getName(), {noHide: false});
        trip_markers.push(circle);

        const pointList = [new L.LatLng(0, 0)];
        const tail = new L.Polyline(pointList, {
          color: trip.getColorByType(),
          weight: 5,
          opacity: 0.5,
          smoothFactor: 1
          }
        );
        trips.push(trip);
        trip_tails.push(tail);
        const lg = L.layerGroup([circle, tail]);
        trip_layers.push(lg);
      }

      this.gtfsanimdata = {};
      this.gtfsanimdata.trip_markers = trip_markers;
      this.gtfsanimdata.trip_tails = trip_tails;
      this.gtfsanimdata.trip_layers = trip_layers;
      this.gtfsanimdata.trips = trips;
      this.animationLayer = L.layerGroup(trip_layers);
      if (this.$rootScope.appdata.anim_visible) {
        this.animationLayer.addTo(this.map);
      }
      this.$rootScope.appdata.anim_data_ready = true;
      this.animate_gtfs_step();
      this.time_last = null;
      return this.$log.debug("initialised animation");
    }

    animate_gtfs_step(run_once) {
      if (run_once == null) {
        run_once = true;
      }

      const {appdata} = this.$rootScope;
      if (!run_once && appdata.anim_stopped) {
        return;
      }

      const {trip_markers} = this.gtfsanimdata;
      const {trip_tails} = this.gtfsanimdata;
      const {trip_layers} = this.gtfsanimdata;
      const {trips} = this.gtfsanimdata;
      var draw_start_time_real = new Date().getTime();

      let n_vehicles = 0;

      const n_vehicles_by_type = {};

      for (let i = 0, end = trips.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
        const trip = trips[i];
        const trip_type_str = this.triptypenames[Number(trip.type)];
        // should the vehicle be shown? (considering also tail lengths)
        if (trip.hasStarted(appdata.sim_time + appdata.tail_length) &&
          (!trip.hasEnded(appdata.sim_time - appdata.tail_length) )) {

          if (!this.animationLayer.hasLayer(trip_layers[i])) {
            // if layer not visible, make it visible:
            this.animationLayer.addLayer(trip_layers[i]);
          }

          // compute new locations
          const [newLatLng, cur_delay, _foo] = Array.from(trip.getLatLngDelayNextIndex(appdata.sim_time));
          const tail = trip.getTailLatLngs(appdata.sim_time, appdata.tail_length);
          trip_tails[i].setLatLngs(tail);
          // select color
          trip_markers[i].setStyle({fillOpacity: 1.0});
          // set location
          trip_markers[i].setLatLng(newLatLng);
          // counting of active vehicles
          if ((n_vehicles_by_type[trip_type_str] == null)) {
            n_vehicles_by_type[trip_type_str] = 0;
          }
          n_vehicles_by_type[trip_type_str] += 1;
          n_vehicles = n_vehicles + 1;
        } else {
          // remove vehicle from sight if it is not visible
          this.animationLayer.removeLayer(trip_layers[i]);
        }
      }

      // rerun if end time has been reached
      if (appdata.sim_time > appdata.sim_time_max - 1) {
        appdata.sim_time = appdata.sim_time_min + 1;
      }
      if (appdata.sim_time < appdata.sim_time_min + 1) {
        appdata.sim_time = appdata.sim_time_max - 1;
      }

      const real_time_now = new Date();
      const real_time_spent = real_time_now - draw_start_time_real;
      const refresh_target = 100;
      const sleep_time = Math.max(40, refresh_target - real_time_spent);
      // this.time_last = real_time_now;

      appdata.sim_time = appdata.sim_time + (((real_time_spent + sleep_time) * appdata.sim_speed) / 1000.0);
      appdata.n_vehicles = n_vehicles;
      appdata.n_vehicles_by_type = n_vehicles_by_type;
      // 'sleep' for some time, use angulars $timeout
      return this.$timeout(() => {
        this.animate_gtfs_step(false)
      }, sleep_time);
    }

    draw_stops() {
      this.$log.debug("drawing stops");
      if (this.map.hasLayer(this.stoplayer)) {
        this.map.removeLayer(this.stoplayer);
      }

      if ((this.$rootScope.appdata.stop_data == null)) {
        this.$log.debug("no segments drawn due to no stop data");
        return;
      }

      const { stop_data } = this.$rootScope.appdata;
      stop_data.sort( (a,b) => b['count']-a['count']);

      let count_max = 0;
      for (var stop of Array.from(stop_data)) {
        if (stop['count'] > count_max) {
          count_max = stop['count'];
        }
      }

      const markers = [];
      const cmap = new ColorMap(["yellow", "red"], [0, count_max], 100);

      for (stop of Array.from(stop_data)) {
        var color, radius;
        const lat = stop['lat'];
        const lon = stop['lon'];
        const count = stop['count'];
        let name = stop['name'];

        if (this.$rootScope.appdata.color_and_size_stops_by_count) {
          if (count === 0) { //do not draw if count equals zero
            continue;
          }
          color = cmap.get_color(count);
          name = name + " (" + count + ")";
          radius = Math.sqrt(count/count_max)*15;
        } else {
          color = "red";
          radius = 3;
        }

        const newLatLng = new L.LatLng(lat, lon);
        const circle = L.circleMarker(newLatLng,
          {
            stroke: false,
            fillColor: color,
            fillOpacity: 1.0,
            title: ""
          }
        ).setRadius(radius).bindTooltip(name);

        markers.push(circle);
      }
      this.stoplayer = L.layerGroup(markers);
      this.stoplayer.addTo(this.map);
      return this.$log.debug(`drew ${markers.length} stops`);

    }


    draw_segments() {
      this.$log.debug("drawing segments");

      if ((this.$rootScope.appdata.segment_data == null)) {
        this.$log.debug("no segments drawn due to no segment data");
        return;
      }


      if (this.map.hasLayer(this.segmentlayer)) {
        this.map.removeLayer(this.segmentlayer);
      }
      const { segment_data } = this.$rootScope.appdata;

      let count_max = 1;
      for (let seg of Array.from(segment_data)) {
        if (seg['count'] > count_max) {
          count_max = seg['count'];
        }
      }

      const cmap = new ColorMap(["yellow", "red"], [0, count_max], 100);

      const segments = [];
      for (let segment of Array.from(segment_data)) {
        var color, width;
        const lats = segment['lats'];
        const lons = segment['lons'];
        const count = segment['count'];
        const name = segment['name'];

        if (this.$rootScope.appdata.color_and_size_segments_by_count) {
          color = cmap.get_color(count);
          width = (15*count)/count_max;
        } else {
          color = "blue";
          width = 2;
        }

        const latLngs = [];
        for (let i = 0, end = lats.length-1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
          latLngs.push(new L.LatLng(lats[i], lons[i]));
        }
        segment = new L.Polyline(latLngs, {
          color,
          weight: width,
          opacity: 0.5,
          smoothFactor: 1
          }
        ).bindTooltip(name + " (" + count + ")", {noHide: false});
        segments.push(segment);
      }
      this.segmentlayer = L.layerGroup(segments);
      this.map.addLayer(this.segmentlayer);
      return this.$log.debug("drew segments");
    }


    draw_routes() {
      this.$log.debug("drawing routes");

      if (this.map.hasLayer(this.routelayer)) {
        this.map.removeLayer(this.routelayer);
      }
      const { route_data } = this.$rootScope.appdata;

      const routes = [];

      // defining these functions outside of the loop so that no multiple copies
      // of the same function are needed
      const on_hover = function(e) {
        const rl = e.target;
        return rl.setStyle({
          opacity: 1.0,
          weight: 10}
        );
      };

      const on_mouseout = function(e) {
        const rl = e.target;
        return rl.setStyle({
          opacity: 0.5,
          weight: 4}
        );
      };

      const n_colors = this.categoryColors.length;
      let color_i = 0;
      const agency_to_color = {};

      for (let route of Array.from(route_data)) {
        // select color for the route:
        var color, lon_offset_base, offset_lat;
        if (this.$rootScope.appdata.color_by_route) {
          color = this.categoryColors[color_i % n_colors];
          color_i += 1;
        } else if (this.$rootScope.appdata.color_by_agency) {
          const agency = route["agency"];
          if (agency in agency_to_color) {
            color = agency_to_color[agency];
          } else {
            color = this.categoryColors[color_i % n_colors];
            agency_to_color[agency] = color;
            color_i += 1;
          }
        } else {
          color = window.Trip.getColorByType(route['route_type']);
        }

        const lats = route['lats'];
        const lons = route['lons'];
        if (lats.length === 0) {
          this.$log.debug(route);
          this.$log.debug(`no coordinates specified for route${route['name']}`);
          continue;
        }

        const latLngs = [];

        if (this.$rootScope.appdata.add_offset_to_routes) {
          offset_lat = ((Math.random()-0.5)*1000)/6371000;
          lon_offset_base = ((Math.random()-0.5)*1000)/6371000;
        } else {
          offset_lat = 0;
          lon_offset_base = 0;
        }

        for (let i = 0, end = lats.length-1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
          const offset_lon = lon_offset_base / Math.sin(Math.PI-((Math.PI/180.0)*Math.abs(lats[i])));
          latLngs.push(new L.LatLng(lats[i]+offset_lat, lons[i]+offset_lon));
        }

        const routeLine = new L.Polyline(latLngs, {
          color,
          weight: 4,
          opacity: 0.5,
          smoothFactor: 1
          });

        if (this.$rootScope.appdata.color_by_agency) {
          routeLine.bindTooltip(`${route['name']} \n ${route["agency"]}`, {noHide: false, direction: 'auto' });
        } else {
          routeLine.bindTooltip(`${route['name']}`, {noHide: false, direction: 'auto' });
        }

        routeLine.on('mouseover', on_hover);
        routeLine.on('mouseout', on_mouseout);

        routes.push(routeLine);
      }

      this.routelayer = L.layerGroup(routes);
      this.map.addLayer(this.routelayer);
      return this.$log.debug("drew routes");
    }


    init_gtfs_spreading() {
      this.$log.debug("initialising spreading");
      if (this.map.hasLayer(this.spreadinglayer)) {
        this.map.removeLayer(this.spreadinglayer);
      }
      this.spreadinglayer = L.layerGroup([]);
      this.spreadingdata = null;

      const trip_markers = [];
      const trip_tails = [];
      const trip_layers = [];
      const trips = [];

      const trip_data = this.$rootScope.appdata.spreading_data;
      for (let i = 0, end = trip_data.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
        const trip = new Trip(trip_data[i]);
        const circle = L.circleMarker([0, 0], {
            stroke: false,
            fillColor: trip.getColorByType(),
            fillOpacity: 1.0,
            title: "unselected"
        });

        // remove vehicle from sight if it is not visible
        circle.setRadius(4).bindTooltip(trip.getName(), {noHide: false});
        trip_markers.push(circle);

        const pointList = [new L.LatLng(0, 0)];
        const tail = new L.Polyline(pointList, {
          color: trip.getColorByType(),
          weight: 5,
          opacity: 0.5,
          smoothFactor: 1
          }
        );
        trips.push(trip);
        trip_tails.push(tail);
        const lg = L.layerGroup([circle, tail]);
        trip_layers.push(lg);
      }

      this.spreadingdata = {};
      this.spreadingdata.trip_markers = trip_markers;
      this.spreadingdata.trip_tails = trip_tails;
      this.spreadingdata.trip_layers = trip_layers;
      this.spreadingdata.trips = trips;
      this.spreadinglayer = L.layerGroup(trip_layers);
      if (this.$rootScope.appdata.spreading_visible) {
        this.spreadinglayer.addTo(this.map);
      }
      this.$rootScope.appdata.spreading_data_ready = true;
      this.spreading_step();
      return this.$log.debug("initialised spreading");
    }

    spreading_step(run_once=true) {
      const { appdata } = this.$rootScope;
      if (!run_once && appdata.spreading_stopped) {
        return;
      }

      const { trip_markers } = this.spreadingdata;
      const { trip_tails } = this.spreadingdata;
      const { trip_layers } = this.spreadingdata;
      const { trips } = this.spreadingdata;

      var draw_start_time_real = new Date().getTime();

      let n_vehicles = 0;
      const n_vehicles_by_type = {};

      for (let i = 0, end = trips.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
        const trip = trips[i];
        const trip_type_str = this.triptypenames[Number(trip.type)];
        // should the vehicle be shown? (considering also tail lengths)
        if (trip.hasStarted(appdata.spreading_sim_time)) {

          if (!this.spreadinglayer.hasLayer(trip_layers[i])) {
            // if layer not visible, make it visible:
            this.spreadinglayer.addLayer(trip_layers[i]);
          }

          // compute new locations
          const [newLatLng, cur_delay, _foo] = Array.from(trip.getLatLngDelayNextIndex(appdata.spreading_sim_time));
          const tail = trip.getTailLatLngs(appdata.spreading_sim_time, Infinity);
          trip_tails[i].setLatLngs(tail);
          // select color
          trip_markers[i].setStyle({fillOpacity:1.0});
          // set location
          trip_markers[i].setLatLng(newLatLng);
          // counting of active vehicles
          if ((n_vehicles_by_type[trip_type_str] == null)) {
            n_vehicles_by_type[trip_type_str] = 0;
          }
          n_vehicles_by_type[trip_type_str] += 1;
          n_vehicles = n_vehicles + 1;
        } else {
          // remove vehicle from sight if it is not visible
          this.spreadinglayer.removeLayer(trip_layers[i]);
        }
      }

      // rerun if end time has been reached
      if (appdata.spreading_sim_time > appdata.spreading_sim_time_max - 1) {
        appdata.spreading_sim_time = appdata.spreading_sim_time_min + 1;
      }
      if (appdata.spreading_sim_time < appdata.spreading_sim_time_min) {
        appdata.spreading_sim_time = appdata.spreading_sim_time_max - 1;
      }

      const real_time_now = new Date();
      const real_time_spent = real_time_now - draw_start_time_real;
      const refresh_target = 100;
      const sleep_time = Math.max(40, refresh_target - real_time_spent);
      const time_out = Math.max(20, refresh_target-real_time_spent);
      appdata.spreading_sim_time = appdata.spreading_sim_time + (((real_time_spent + sleep_time) * appdata.spreading_sim_speed) / 1000.0);

      // 'sleep' for some time, use angulars $timeout
      if (run_once) {
        return;
      } else {
        return this.$timeout( () => {return this.spreading_step(false);}, time_out);
      }
    }
  }

var controllersModule = angular.module(CONTROLLERS_MODULE_NAME);
controllersModule.controller(CONTROLLER_NAME, ['$log', '$scope', '$rootScope', '$timeout', 'GtfsService', MapCtrl]);
export default CONTROLLER_NAME;
