# drugbank-sample-apps
Sample apps for drugbank, private for now

## Components

### Front-End
- [Bootstrap](https://getbootstrap.com/)
- [jQuery](https://jquery.com/)
- [Select2](https://select2.org/)
- [DataTables](https://datatables.net/)
- [Prism](https://prismjs.com/)

### Back-End
|     Implementation    |     Package Manager                                                       |     Microframework                                          |     HTTP Client                                                                                                              |     Template Engine                                                     |
|-----------------------|---------------------------------------------------------------------------|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
|     Java              |     [Apache Maven](https://maven.apache.org)                              |     [Spark](http://sparkjava.com/)                          |     [`javax.net.ssl.HttpsURLConnection`](https://docs.oracle.com/javase/7/docs/api/javax/net/ssl/HttpsURLConnection.html)    |     [jinjava](https://github.com/HubSpot/jinjava)   (Jinja2)            |
|     Node.js           |     [npm](https://www.npmjs.com/)                                         |     [Express](https://expressjs.com/)                       |     [axios](https://github.com/axios/axios)                                                                                  |     [nunjucks](https://github.com/mozilla/nunjucks)   (Jinja2)          |
|     PHP               |     [Composer](https://getcomposer.org/)                                  |     [Slim](http://www.slimframework.com/)                   |     [Guzzle](https://github.com/guzzle/guzzle)                                                                               |     [slim/twig-view](https://github.com/slimphp/Twig-View)   (Twig)     |
|     Python            |     [pip](https://packaging.python.org/tutorials/installing-packages/)    |     [Flask](https://flask.palletsprojects.com/en/1.1.x/)    |     [Requests](https://requests.readthedocs.io/en/master/)                                                                   |     [Jinja](https://jinja.palletsprojects.com/en/2.11.x/)   (Jinja2)    |
|     Ruby              |     [Bundler](https://bundler.io/)                                        |     [Sinatra](http://sinatrarb.com/)                        |     [httparty](https://github.com/jnunemaker/httparty)                                                                       |     [Haml](http://haml.info/) (Haml)                                    |

##### Note: Twig is similar to Jinja2, so the Jinja2 templates are used in the PHP app without issue.

# How to Use

### General Information

By default, each app should be running at http://127.0.0.1:4567/ and is accessed by going to that address in a web browser. To stop the server, press CTRL+C.

Each implementation determines the port to run on as well as the DrugBank API key and the region to use for searches from the `config.json` file at the root of the repo. To change the port, API key, or region, simply change the values in the `config.json`. The region and API key can also be changed from the support page within the app.

##### Note: the Java app may not behave like this, as when it is compiled it creates a copy of `config.json` for itself at `drugbank-sample-apps\java\db-app\target\classes`.

In the future, each app will be setup up with docker containers for fast and easy setup.

## Java
First, ensure that [Apache Maven](https://maven.apache.org/install.html) is installed.

Navigate to `drugbank-sample-apps/java/db-app`. Compile the app by running
```bash
mvn clean compile
```

The app is then run with the command
 ```bash
mvn exec:java
```

Visit [http://localhost:`port`/](http://127.0.0.1:4567/) to view the app, where `port` is the port number declared in the `config.json`. The current port will also be be given in the console.

## Node.js
Navigate to `drugbank-sample-apps/nodejs`. Run the command
```bash
npm install
```
to install all dependencies. The app is then run with the command
 ```bash
node app.js
```

Visit the address given in the console to view the app. 

## PHP
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

## Python

### Setting Up the Virtual Environment

Navigate to `drugbank-sample-apps/python`. Run the command 
```bash
pip install virtualenv
```

to install the virtual environment for running the app. Activate the Python environment by running the following command:

Mac OS / Linux
```bash
source env/bin/activate
```

Windows
```bash
env\Scripts\activate
```

You should see the name of your virtual environment in brackets on your terminal line. Any Python commands you use will now work with the virtual environment.

Now, install all the requirements needed for the app in the virtual environment. To do this, run the command 
```bash
pip install -r requirements.txt
```

To deactivate the virtual environment and use your original Python environment, simply type ‘deactivate’.
```bash
deactivate
```

### Running the App

With the virtual environment set and the requirements installed, execute the following command:
```bash
python app.py
```

Visit the address given in the console to view the app.

## Ruby

First, ensure that  [Bundler](https://bundler.io/) is installed.

Navigate to `drugbank-sample-apps/nodejs`. Install the necessary gems by using the command
```bash
bundle install
```

The app is then run with the command
```bash
bundle exec ruby app.rb
```

Visit the default address  with the port given in the console to view the app.
