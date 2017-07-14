// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS201: Simplify complex destructure assignments
 * DS202: Simplify dynamic range loops
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  let typeNames = undefined;
  let typeColors = undefined;
  const Cls = (window.Trip = class Trip {
    static initClass() {
  
      typeNames = [
        "Tram",
        "Subway",
        "Rail",
        "Bus",
        "Ferry",
        "Cable car",
        "Gondola",
        "Funicular",
        "Walk"
      ];
  
      typeColors = [
        'rgb(77,175,74)',  // green
        'rgb(255,127,0)',  // orange
        'rgb(228,26,28)', // red
        'rgb(55,126,184)', // blue
        'rgb(255,255,51)', // yellow
        'rgb(166,86,40)',   // brown
        'rgb(152,78,163)', // violet
        'rgb(247,129,191)', // pink
        'rgb(150,150,150)' // grey
      ];
    }

    constructor(tripdata) {
      this.times = tripdata['times'];
      if (tripdata['delays'] != null) {
        this.delays = tripdata['delays'];
      } else {
        /* a hack for the time being: */
        this.delays = (Array.from(this.times).map((el) => 0));
      }
      this.lats = tripdata['lats'];
      this.lons = tripdata['lons'];
      this.name = `${tripdata['name']}`;
      this.type = tripdata['route_type'];
      /*
      convert more refined
      gtfs route_type extensions
      to the more standard ones:
      */
      // https://support.google.com/transitpartners/answer/3520902?hl=en
      this.type = window.Trip.mapType(this.type);
      this.start_time = this.times[0], this.end_time = this.times[this.times.length - 1];
      this.next_index = null;
      this.p = null;
      this.latlons = [];
      for (let i = 0, end = this.lats.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
        this.latlons.push(new L.LatLng(this.lats[i], this.lons[i]));
      }
    }

    static mapType(type) {
      if (type === 109) { // suburban railway
        type = 2; // rail
      }
      if (type === 800) { // trolley bus
        type = 3; // bus
      }
      return type;
    }

    static getTypeNames() {
      return typeNames;
    }

    static getTypeColors() {
      return typeColors;
    }

    static getColorByType(type) {
      type = window.Trip.mapType(type);
      if (type != null) {
        if (type === -1) { // treat walking separately:
          return typeColors[typeColors.length-1];
        }
        if (type > (typeColors.length - 1)) {
          console.log("type observed:", type);
        }
        return typeColors[type];
      } else {
        console.log("No type specified");
        return null;
      }
    }


    isOn(time) {
      return (time >= this.start_time) && (time <= this.end_time);
    }

    hasStarted(time) {
      return time >= this.start_time;
    }

    hasEnded(time) {
      return time >= this.end_time;
    }

    getName() {
      return this.name;
    }

    getColorByType() {
      /* type is an int as specifiec by gtfs */
      if (this.type != null) {
        if (this.type === -1) { // treat walking separately:
          return typeColors[typeColors.length-1];
        }
        if (this.type > (typeColors.length - 1)) {
          console.log("type observed:", this.type);
        }
        return typeColors[this.type];
      } else {
        console.log("No type specified");
        return null;
      }
    }


    getLatLngDelayNextIndex(time) {
      let delay, lat, lon;
      const next_index = _.sortedIndex(this.times, time);
      if (next_index === 0) {
        lat = this.lats[0];
        lon = this.lons[0];
        delay = this.delays[0];
      } else if (next_index === this.times.length) {
        // just some bug overkill for the case where
        const tmp_index = this.times.length-1;
        lat = this.lats[tmp_index];
        lon = this.lons[tmp_index];
        delay = this.delays[tmp_index];
      } else {
        const p = (time - this.times[next_index-1])/(this.times[next_index]- this.times[next_index-1]);
        lat = (this.lats[next_index]*p)+(this.lats[next_index-1]*(1-p));
        lon = (this.lons[next_index]*p)+(this.lons[next_index-1]*(1-p));
        delay = (this.delays[next_index]*p)+(this.delays[next_index-1]*(1-p));
      }

      const newLatLng = new L.LatLng(lat, lon);
      return [newLatLng, delay, next_index];
    }

    getTailLatLngs(time, tail_seconds) {
      const [tailLatLng, tail_delay, tail_next_index] = Array.from(this.getLatLngDelayNextIndex(time-tail_seconds));
      const [curLatLng, delay, next_index] = Array.from(this.getLatLngDelayNextIndex(time));
      const tailLatLngs = this.latlons.slice(tail_next_index, next_index);
      tailLatLngs.push(curLatLng);
      tailLatLngs.unshift(tailLatLng);
      return tailLatLngs;
    }
  });
  Cls.initClass();
  return Cls;
})();
