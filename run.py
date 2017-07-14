import json
import os
from sqlite3 import OperationalError
from glob import glob

from flask import Flask, request
from gtfspy import gtfs
from gtfspy import stats
from flask.ext.makestatic import MakeStatic
from flask.ext.runner import Runner

import settings
from flask_cors import CORS, cross_origin

if __name__ == '__main__':
    # Development mode: run as main script.
    DEBUG = True
    # Obviously this must be changed in production...
    SECRET_KEY = "/jrEA|'OSMV#s#Y<ziiM'h.cuS&jKY"
else:
    # Production mode.  Currently under URL /transit/
    BASE_URL = '/transit/'


app = Flask(__name__, static_url_path='')
CORS(app)
app.config.from_object(__name__)


# This provides a HTML toolbar that allows debugging, mainly
# profiling.  The request must be HTML, minimal working thing is:
# return '<body>%s</body>'%json.dumps(...)
#from flask.ext.debugtoolbar import DebugToolbarExtension
#toolbar = DebugToolbarExtension(app)

@app.route("/")
def index():
    return json.dumps({})

if not __name__ == '__main__':
    # If in production: add a logging handler
    import logging
    from logging import FileHandler
    file_handler = FileHandler('log/log.txt')
    file_handler.setLevel(logging.WARNING)
    app.logger.addHandler(file_handler)

viz_cache = {}

def cache(func, *args, **kwargs):
    """
    Parameters
    ----------
    func: function
    """
    name = func.func_name
    args_ = hash(tuple(args))
    kwargs_ = hash(tuple(kwargs.items()))
    cache_key = (name, args_, kwargs_)
    if cache_key not in viz_cache:
        viz_cache[cache_key] = func(*args, **kwargs)
    else:
        print("found in cache")
    return viz_cache[cache_key]

# Database filenames.  Make a list of all filenames.  Remove the
# common prefix.  Save a cache of everything that needs to be sent to
# the server.  This is re-generated every time this file is reloaded,
# and only then (but that is as often as it was before this was split
# out, too).
def find_dbfnames():
    dbfnames = []
    for sdir in settings.DB_DIRS:
        # If is a regular file, just use this directly.
        if os.path.isfile(sdir):
            dbfnames.append(sdir)
            continue
        # Directories: all sub-directory sqlite files.
        for cur_dir, subdirs, files in os.walk(sdir):
            for ending in settings.DB_ENDINGS:
                dbfnames.extend(glob(os.path.join(cur_dir, ending)))
    dbfnames = list(set(dbfnames)) # remove any duplicates
    # Remove common prefix
    if len(dbfnames) == 1:
        commonprefix = ""
    else:
        commonprefix = os.path.commonprefix(dbfnames)
        dbfnames = [fname[len(commonprefix):] for fname in dbfnames]
    # exclude tests:
    dbfnames = sorted([e for e in dbfnames if "proc/test/" not in e])
    valid_dbfnames = []
    timezone_dict = {}
    for dbf in dbfnames:
        try:
            timezone_dict[dbf] = gtfs.GTFS(commonprefix+dbf).get_timezone_string()
            valid_dbfnames.append(dbf)
        except OperationalError as e:
            print("database " + dbf + " is not available due to: \n" + e.message)

    data = {'dbfnames': valid_dbfnames,
            'timezones': timezone_dict}
    dbfname_cache = json.dumps(data)
    return dbfnames, commonprefix, dbfname_cache

# Run finder function to set the needed variables.
dbfnames, commonprefix, dbfname_cache = find_dbfnames()

def get_dbfname(dbfname):
    """Return actual filename from user-provided filename.

    This has two purposes
    - Re-add the commonprefix which was removed above.
    - Return None if the filename is not in `dbfnames`.  We *have* to
      check it against an authorized list, or else someone could open
      any file on disk.  We can either sanitize it, or we can only allow
      ones in the list to be opened.  We use the second option because
      it is simpler and less error prone.

      Of these, the second is the most important.  Removing the common
      prefix has the nice property that any attempt to open a dbfname that
      does *not* use this function to sanitize input will fail (on good data)
    """
    # TODO: O(N)
    if dbfname not in dbfnames:
        return None
    return commonprefix + dbfname

@app.route("/gtfsdbs")
def available_gtfs_dbs():
    """
    Returns available databases and the timezone for each database.
    These results are cached after the first request
    """
    return dbfname_cache

    # data = {'hsl-2015-04-24.sqlite':
    #     {
    #         start_time_ut : 0,
    #         end_time_ut : float("inf"),
    #         max_activity_hour_start_ut : 0,
    #         centroid_lat : 0,
    #         centroid_lon : 0
    #     }
    # }
    # database_names = ["hsl-2015-04-24.sqlite", "hsl-2015-07-12.sqlite"]
    # return json.dumps(data)


@app.route("/gtfs_viz")
def get_scheduled_trips_within_interval():
    #print request.args
    tstart = request.args.get('tstart', None)
    tend = request.args.get('tend', None)
    dbfname = get_dbfname(request.args.get('dbfname', None))
    shapes = request.args.get('use_shapes', None)

    if shapes == "1":
        shapes = True
    else:
        shapes = False
    if tstart:
        tstart = int(tstart)
    if tend:
        tend = int(tend)

    G = gtfs.GTFS(dbfname)  # handles connections to database etc.

    trips = G.get_trip_trajectories_within_timespan(start=tstart, end=tend, use_shapes=False)
    return json.dumps(trips)

@app.route("/gtfsstats")
def get_gtfs_stats():
    dbfname = get_dbfname(request.args.get('dbfname', None))
    if not dbfname:
        return json.dumps({})
    G = gtfs.GTFS(dbfname)
    data = stats.get_stats(G)
    return json.dumps(data)


@app.route("/gtfsspan")
def get_start_and_end_time_ut():
    dbfname = get_dbfname(request.args.get('dbfname', ""))
    if dbfname is "null":
        dbfname = ""
    G = gtfs.GTFS(dbfname)
    start, end = G.get_approximate_schedule_time_span_in_ut()
    data = {
        "start_time_ut": start,
        "end_time_ut": end
    }
    return json.dumps(data)

@app.route("/gtfstripsperday")
def get_trip_counts_per_day():
    dbfname = get_dbfname(request.args.get('dbfname', None))
    if not dbfname:
        return json.dumps({})
    g = gtfs.GTFS(dbfname)
    data = g.get_trip_counts_per_day()
    return json.dumps(data.to_dict(orient="list"))


@app.route("/stopdata")
def view_stop_data():
    #print request.args
    tstart = int(request.args.get('tstart', None))
    tend = int(request.args.get('tend', None))
    dbfname = get_dbfname(request.args.get('dbfname', None))
    G = gtfs.GTFS(dbfname)  # handles connections to database etc.
    stopdata = G.get_stop_count_data(tstart, tend)
    return stopdata.to_json(orient="records")
    # json.dumps(stopdata.to_dict("records"))


@app.route("/segmentdata")
def view_segment_data():
    #print request.args
    tstart = int(request.args.get('tstart', None))
    tend = int(request.args.get('tend', None))
    dbfname = get_dbfname(request.args.get('dbfname', None))
    shapes = request.args.get('use_shapes', None)
    if shapes == "1":
        shapes = True
    else:
        shapes = False
    G = gtfs.GTFS(dbfname)  # handles connections to database etc.
    data = G.get_segment_count_data(tstart, tend, use_shapes=shapes)
    return json.dumps(data)


@app.route("/getroutes")
def view_line_data():
    #print request.args
    dbfname = get_dbfname(request.args.get('dbfname', None))
    shapes = request.args.get('use_shapes', None)
    if shapes == "1":
        shapes = True
    else:
        shapes = False
    G = gtfs.GTFS(dbfname)  # handles connections to database etc.
    data = G.get_all_route_shapes(use_shapes=shapes)
    return json.dumps(data)


@app.route("/spreading")
def view_spreading_explorer():
    dbfname = get_dbfname(request.args.get('dbfname', None))
    shapes = request.args.get('use_shapes', None)
    tstart = request.args.get('tstart', None)
    tend = request.args.get('tend', None)
    lat = request.args.get('lat', None)
    lon = request.args.get('lon', None)
    if not dbfname:
        return json.dumps({})
    if tstart:
        tstart = int(tstart)
    if tend:
        tend = int(tend)
    if lat:
        lat = float(lat)
    if lon:
        lon = float(lon)
    if shapes == "1":
        shapes = True
    else:
        shapes = False
    # handles connections to database etc.
    G = gtfs.GTFS(dbfname)
    data = G.get_spreading_trips(tstart, lat, lon, tend - tstart, use_shapes=shapes)
    #  add shapes later: use_shapes=shapes)
    return json.dumps(data)


application = app  # for deployment via WSGI.

if __name__ == "__main__":
    # makestatic = MakeStatic(app)
    runner = Runner(app)

    #app.run()
    # if globals().get('DEBUG', False):
    #    makestatic.watch()

    runner.run()


