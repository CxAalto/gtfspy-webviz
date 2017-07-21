-------------
gtfspy-webviz
-------------

Visualizing public transport schedule data (GTFS) interactively in a web-browser.

![Screenshot](docs/sample_image.png?raw=true "Screenshot")

For the time being, a live demo can be found here: [http://transportnetworks.cs.aalto.fi/webviz/](http://transportnetworks.cs.aalto.fi/webviz/).


Prerequisites
-------------
- Python 3.5
- node & npm: https://nodejs.org/

An easy way to get things going with Python 3.5 is to use [conda](https://www.continuum.io/downloads):
```
conda create --name gtfspy-webviz python=3.5
source activate gtfspy-webviz
```

```
pip install -r requirements.txt
npm install
```

How-to
------
First import GTFS data using the gtfspy [Python package](https://github.com/CxAalto/gtfspy) into an SQLite directory stored on disk.
[An example how to do this.](https://github.com/CxAalto/gtfspy/blob/master/examples/example_import.py).

Change the `DB_DIR` variable in the `settings.py` file to point to the directory where you have stored the SQLite database.
If you have stored the database with another file ending than what is listed in the `settings.py`, please add the file ending to that list.

Run the following in the terminal:

  ```
  python run.py # starts the backend-development server
  npm start # starts the development environment
  ```

Open http://localhost:8080/ in your browser. Enjoy.


License
-------
All files under directories src/js src/html src/css are licensed under MIT license.
For the licenses of the Javascript libraries under src/lib, please see their source code.


To build the front-end for deployment elsewhere
-----------------------------------------------
```
npm run-script build
```

Main author 
-----------
@rmkujala, Rainer.Kujala@gmail.com

Other contributors
------------------
Richard Darst, Christoffer Weckström

Ackwnowledgements
-----------------
The development of this visualization tool has benefited from the support by Academy of Finland through the DeCoNet project.

See also
--------
[gtfspy Python package for analyzing public transport networks](https://github.com/CxAalto/gtfspy)
