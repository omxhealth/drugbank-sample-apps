# drugbank-sample-apps
Sample apps for drugbank, private for now

# How to Use

### Language-Specific
- [Java](#java)
- [Node.js](#node.js)
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
Navigate to `drugbank-sample-apps/nodejs`. Install the necessary gems with [Bundler](https://bundler.io/) by using the command

```bash
bundle install
```

The app is then run with the command

```bash
bundle exec ruby app.rb
```
Visit the default address  with the port given in the console to view the app.
