# drugbank-sample-apps
Sample apps for drugbank, private for now

## Components

### Java
 - Package Manager: [Apache Maven](https://maven.apache.org)
 - Microframework: [Spark](http://sparkjava.com/) 
 - HTTP Client: [`javax.net.ssl.HttpsURLConnection`](https://docs.oracle.com/javase/7/docs/api/javax/net/ssl/HttpsURLConnection.html)
 - Template Engine: [jinjava](https://github.com/HubSpot/jinjava) (Jinja2)
 
### Node.js
- Package Manager: [npm](https://www.npmjs.com/)
- Microframework: [Express](https://expressjs.com/) 
- HTTP Client: [axios](https://github.com/axios/axios)
- Template Engine: [nunjucks](https://github.com/mozilla/nunjucks) (Jinja2)

### PHP
- Package Manager: [Composer](https://getcomposer.org/)
- Microframework: [Slim](http://www.slimframework.com/) 
- HTTP Client: [Guzzle](https://github.com/guzzle/guzzle)
- Template Engine: [slim/twig-view](https://github.com/slimphp/Twig-View) (Twig)
	-  Twig is very similar to Jinja2, so the Jinja2 templates are reused without issue.

### Python
- Package Manager: [pip](https://packaging.python.org/tutorials/installing-packages/)
- Microframework: [Flask](https://flask.palletsprojects.com/en/1.1.x/)
- HTTP Client: [Requests](https://requests.readthedocs.io/en/master/)
- Template Engine: [Jinja](https://jinja.palletsprojects.com/en/2.11.x/) (Jinja2)

### Ruby
- Package Manager: [Bundler](https://bundler.io/)
- Microframework: [Sinatra](http://sinatrarb.com/)
- HTTP Client: [httparty](https://github.com/jnunemaker/httparty)
- Template Engine: [Haml](http://haml.info/) (Haml)


# How to Use

- [Java](#java)
- [Node.js](#node.js)
- [PHP](#php)
- [Python](#python)
- [Ruby](#ruby)

### General Information
By default, each app should be running at http://127.0.0.1:4567/ and is accessed by going to that address in a web browser. To stop the server, press CTRL+C.

Each implementation determines the port to run on as well as the Drugbank API host and key from the `config.json` file at the root of the repo. To change the port, API key, or API host, simply change the values in the `config.json`. 
Note that the Java app may not like this, as when it is compiled it creates a copy for itself at `drugbank-sample-apps\java\db-app\target\classes`.

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
#### Note: due to the way Slim handles static resources, a location outside of the project could not be specified like for the other apps. Copies had to be made and placed at `drugbank-sample-apps/php/public`. Keep this in mind if you want to edit or add resources.

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

To host with a different server like Apache, see Slim's [web server](http://www.slimframework.com/docs/v4/start/web-servers.html) documentation.

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
