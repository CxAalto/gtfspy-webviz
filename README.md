-------------
gtfspy-webviz
-------------

![Screenshot](docs/sample_image.png?raw=true "Screenshot")

Prerequisites
-------------
- Python 3.5
- node & npm: https://nodejs.org/

An easy way to get things going with Python 3.5 is to use [conda](https://www.continuum.io/downloads):

```
conda create --name gtfspy-webviz python=3.5
source activate gtfspy-webviz
```

To install
----------

```
pip install -r requirements.txt
npm install
```

To specify database directories
-------------------------------
Change the DB_DIR variable in the settings.py file.

License
-------
All files under directories src/js src/html src/css are licensed under MIT license.
For the licenses of the Javascript libraries under src/lib, please see their source code.

To run
------

```
python run.py # starts the server
npm start # starts the development environment
```

Open http://localhost:8080/ in your browser.


To build the front-end
----------------------
```
npm run-script build`
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
