# DrugBank Sample Applications

<p align="left">
  <img src="https://raw.githubusercontent.com/omxhealth/drugbank-sample-apps/master/resources/images/Sample%20App%20Screenshot.png" width="900px">
</p>

Sample applications for accessing the DrugBank API with a back-end written in multiple languages.

## Components

### Front-End
- [Bootstrap](https://getbootstrap.com/)
- [jQuery](https://jquery.com/)
- [Selectize.js](https://selectize.github.io/selectize.js/)
- [Select2](https://select2.org/)
- [DataTables](https://datatables.net/)
- [Prism](https://prismjs.com/)

### Back-End
|     Implementation    |     Package Manager                                                       |     Microframework                                          |     HTTP Client                                                                                                              |     Template Engine                                                     |
|-----------------------|---------------------------------------------------------------------------|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
|     Java              |     [Apache Maven](https://maven.apache.org)                              |     [Spark](http://sparkjava.com/)                          |     [`javax.net.ssl.HttpsURLConnection`](https://docs.oracle.com/javase/7/docs/api/javax/net/ssl/HttpsURLConnection.html)    |     [jinjava](https://github.com/HubSpot/jinjava)   (Jinja2)            |
|     Node.js           |     [npm](https://www.npmjs.com/)                                         |     [Express](https://expressjs.com/)                       |     [axios](https://github.com/axios/axios)                                                                                  |     [nunjucks](https://github.com/mozilla/nunjucks)   (Jinja2)          |
|     PHP               |     [Composer](https://getcomposer.org/)                                  |     [Slim](http://www.slimframework.com/)                   |     [Guzzle](https://github.com/guzzle/guzzle)                                                                               |     [slim/twig-view](https://github.com/slimphp/Twig-View)   (Twig*)     |
|     Python            |     [pip](https://packaging.python.org/tutorials/installing-packages/)    |     [Flask](https://flask.palletsprojects.com/en/1.1.x/)    |     [Requests](https://requests.readthedocs.io/en/master/)                                                                   |     [Jinja](https://jinja.palletsprojects.com/en/2.11.x/)   (Jinja2)    |
|     Ruby              |     [Bundler](https://bundler.io/)                                        |     [Sinatra](http://sinatrarb.com/)                        |     [httparty](https://github.com/jnunemaker/httparty)                                                                       |     [Haml](http://haml.info/) (Haml)                                    |

##### *Twig is similar to Jinja2, so the Jinja2 templates are used in the PHP app without issue.

# How It Works

The sample application is a [web app](https://en.wikipedia.org/wiki/Web_application) that is accessed through the usage of a web browser. When an app is run, a server starts on your local machine that handles communications between the DrugBank API and the web app, and serves HTML, CSS, and JavaScript for the app. Each implementation is built using a [microframework](https://en.wikipedia.org/wiki/Microframework). 

All requests from the web app to the API are handled by the server. The server receives the request from the web app, and sends it along to the DrugBank API. The response from the API is sent back to the server, and the server sends it back to the web app.

## Token Authentication 
Included is a variant of the app that uses JSON Web Tokens to access the the API directly from web browsers. Tokens allow short term access to the DrugBank API without exposing your secret API key, and are guaranteed to expire within 24 hours. For more information, check [here](https://docs.drugbankplus.com/v1/#token-authentication).

<b>The use of token authentication is required for accessing DrugBank APIs directly from web browsers.</b> 

# How to Use

### General Information

By default, each app should be running at http://127.0.0.1:8080/ and is accessed by going to that address in a web browser. To stop the server, press CTRL+C.

Each implementation determines the port to run on as well as the DrugBank API key and the region to use for searches from the `config.json` file at the root of the repo. To change the port, API key, or region, simply change the values in the `config.json`. The region and API key can also be changed from the support page within the app.

##### Note: the Java app may not behave like this, as when it is compiled it creates a copy of `config.json` for itself at `drugbank-sample-apps\java\db-app\target\classes`.

### Docker

All apps can be run via [Docker](https://www.docker.com/). The easiest way to do this is through
Docker Compose commands:

| app        | command                        |
|------------|--------------------------------|
| java       | `docker-compose up java`       |
| nodejs     | `docker-compose up nodejs`     |
| nodejs-JWT | `docker-compose up nodejs-jwt` |
| php        | `docker-compose up php`        |
| python     | `docker-compose up python`     |
| ruby       | `docker-compose up ruby`       |

Docker containers and images created through these commands can be cleaned up by running the
following from the project root:

```sh
./clean-docker.sh
```

## Manual setup
### Java
First, ensure that [Apache Maven](https://maven.apache.org/install.html) is installed.

Navigate to `drugbank-sample-apps/java/db-app`. Compile the app by running
```bash
mvn clean compile
```

The app is then run with the command
 ```bash
mvn exec:java
```

Visit [http://localhost:`port`/](http://127.0.0.1:8080/) to view the app, where `port` is the port number declared in the `config.json`. The current port will also be be given in the console.

### Node.js
Navigate to `drugbank-sample-apps/nodejs` (or `drugbank-sample-apps/nodejs - JWT` for the token-based app). Run the command
```bash
npm install
```
to install all dependencies. The app is then run with the command
 ```bash
node app.js
```

Visit the address given in the console to view the app. 

### PHP
##### Note: due to the way Slim handles static resources, a location outside of the project could not be specified like for the other apps. Copies of the JavaScript and CSS files had to be made and placed at `drugbank-sample-apps/php/public`. Keep this in mind if you want to edit or add resources.

First, ensure that [Composer](https://getcomposer.org/) is installed.

Navigate to `drugbank-sample-apps/php`. Run the command 
```bash
php composer.phar install
```
to install the needed dependencies. To host the app on PHP's built in server, use the command
```bash
php -S localhost:port -t public public/index.php
```

where `port` is the port you want to host the app on. The port must be specified with the launch command, so it can't be determined from the `config.json` like the other apps. 

Visit `localhost:port` to view the app.

To host with a different server (like Apache), see Slim's [web server](http://www.slimframework.com/docs/v4/start/web-servers.html) documentation.

### Python

The Python app is run in a virtual environment, which is how the Flask documentation recommends installing and running the app. Below is a quick rundown on getting the app up and running with a virtual environment. More information can be found below:
 - [Flask Documentation](https://flask.palletsprojects.com/en/1.1.x/installation/)
 - [PyPA Documentation](https://packaging.python.org/guides/installing-using-pip-and-virtual-environments/#creating-a-virtual-environment)

 Of course, the app can be run without a virtual environment. To do so, just skip to [Installing the Requirements](#installing-the-requirements).

#### Creating the Virtual Environment

Navigate to `drugbank-sample-apps/python`. Run the following command to create the virtual environment from where the app will run.

On macOS and Linux:
```bash
python3 -m venv env
```

On Windows:
```bash
py -m venv env
```

If you are using Python 2, replace `venv` with `virtualenv` in the commands.

A virtual environment called `env` is now located at `drugbank-sample-apps/python/env`.

#### Activating the Virtual Environment

On macOS and Linux:
```bash
source env/bin/activate
```

On Windows:
```bash
.\env\Scripts\activate
```

You should see the name of the virtual environment in brackets on your terminal line. Any Python commands you use will now work with the virtual environment.

To leave the virtual environment, simply run:
```bash
deactivate
```

#### Installing the Requirements

Now, install all the requirements needed for the app in the virtual environment. To do this, run:
```bash
pip install -r requirements.txt
```

#### Running the App

With the virtual environment set and the requirements installed, run:
```bash
python app.py
```

Visit the address given in the console to view the app.

### Ruby

#### Setting the Ruby Version
Ensure that you have Ruby 2.7.1 [installed](https://www.ruby-lang.org/en/downloads/).

Navigate to `drugbank-sample-apps/ruby`.

If you are using rbenv, Ruby 2.7.1 will be used automatically due to the `.ruby-version` file.

If you are using RVM, use the command
```bash
rvm use 2.7.1
```

If you are using chruby, use the command
```bash
chruby ruby-2.7.1
```
or if you have [auto-switching](https://github.com/postmodern/chruby/blob/master/README.md#auto-switching) enabled, the correct version will be used from the `.ruby-version` file.

#### Running the app

First, ensure that [Bundler](https://bundler.io/) is installed.

 Install the necessary gems by using the command
```bash
bundle install
```

The app is then run with the command
```bash
bundle exec ruby app.rb
```

Visit the default address with the port given in the console to view the app.
