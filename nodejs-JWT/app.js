const path = require("path");
const fs = require("fs");
const axios = require("axios").default; // promise based HTTP client
const express = require("express"); // web framework 
const nunjucks = require("nunjucks"); // a templating engine similar to jinja2
const session = require('express-session'); // session managment middleware
const crypto = require('crypto')

const config_file = "config.json"; // the name of the config file

/* App Initialization */

// Initialize the Express app to read JSON and set the static files path
const app = express();
app.use(express.json());
app.use(express.static("./resources"));

// Configure nunjucks and set the templates path
var env = nunjucks.configure(path.join(__dirname, "./resources/templates"), {
    autoescape: true,
    express: app
});

// Add the indications page filter that's used when 
// looping through all the options and displaying them
env.addFilter("indication_option", function(name) {
    return name.toLowerCase().split(" ").join("_");
});

// Open the config file
let config = openConfig("../" + config_file);

// Set variables from config
let port = config["port"]; // the port the server will be hosted on
let secretKey = config["secret_key"] // session secret key
let secure = config["secure"] // should be true when using https or false when running locally or without https
let behind_proxy = config["behind_proxy"] // trust proxy uncomment if running behind a proxy like nginx
let DRUGBANK_API = "https://api.drugbankplus.com/v1/"; // the DrugBank API link

if (behind_proxy) {
    app.set('trust proxy', 1) 
}

// Setup server side sessions.
app.use(session({
    secret: secretKey,
    name: 'drugbank-jwt-sample',
    resave: true,
    cookie: {
        httpOnly: true,
        secure: secure,
        sameSite: true,
        maxAge: 600000 // Time is in miliseconds
    }
}))

// Start the server    
app.listen(port, () => console.log(`App listening at http://localhost:${port}`)); 

/* Set welcome page route */

// GET render: welcome page
app.get("/", function (req, res) {
    res.render("welcome.jinja", {region : req.session.region});
});

/* Set product concepts routes */   

// GET render: product concepts page    
app.get("/product_concepts", function (req, res) {
    res.render("product_concepts.jinja", {region : req.session.region});
});  

/* Set drug-drug interactions routes */

// GET render: drug-drug interactions (ddi) page    
app.get("/ddi", function (req, res) {
    res.render("ddi.jinja", {region : req.session.region});
});

/* Set indications routes */

// GET render: indications page    
app.get("/indications", function (req, res) {
    res.render("indications.jinja", {region : req.session.region});
});

// GET API: new token
app.get("/new_token", async function (req, res) {
    let body = {"ttl": "24"};
    let db_res = await drugbank_post("tokens", req.session.api_key, body, null);
    res.status(db_res.status);
    res.json(db_res.data);
});

// PUT: update API authorization key 
app.put("/auth_key", function (req, res) {
    
    let json_response;
    let status = 200;
    let message = "";
    
    let old_key = req.session.api_key;
    let new_key = req.body.q;

    if (new_key == old_key) {
        
        message = "New key is the same as the old key";
    } else if (new_key == "") {
        status = 400;
        message = "No key was provided";
    } else {
        req.session.api_key = new_key
        message = "Key successfully updated";
    }
    
    json_response = {
        "original-key": old_key,
        "updated-key": new_key,
        "message": message
    };

    res.status(status);
    res.json(json_response);

});

// PUT: update region
app.put("/region", function (req, res) {
    
    let new_region = req.body.region.toLowerCase();
    let json_response;
    let status = 200;
    let message = "";

    if (new_region == req.session.region) {
        message = "New region is the same as the old region";
    } else if (is_valid_region(new_region)) {
        req.session.region = new_region;
        message = "Region successfully updated";
    } else {
        status = 400;
        message = new_region + " is not a valid region.";
    }

    json_response = {
        "message": message
    };

    res.status(status);
    res.json(json_response);

});

/**
 * Attempts to open the config file on the
 * provided relative path. If no file exists,
 * it is created with defaulted values,
 * 
 * Returns a JSON object containing the values 
 * from the config file.
 */
function openConfig(path) {

    var config;

    try {
        var config_data_in = fs.readFileSync(path);  
        config = JSON.parse(config_data_in);
    } catch (error) {
        console.log("Creating file " + path + " with default values");

        config = {
            "port": "8080",
            "secret_key": crypto.randomBytes(64).toString('hex'),
            "secure": false,
            "behind_proxy": false
        }

        fs.writeFileSync("../" + config_file, JSON.stringify(config, undefined, 2));

    }

    return config;
    
}

/**
 * Checks that the region is valid.
 * Region can either be "us", "ca", "eu", or "" (for searching all).
 */
function is_valid_region(region) {

    switch (region) {
        case "us":
        case "ca":
        case "eu":
        case "":
            return true;
        default:
            return false;
    }
}

/**
 * Makes a post request to the DrugBank API with query parameters.
 * Uses axios to send the request, and returns the received JSON response.
 * @param {*} route - route into the DrugBank API
 * @param {*} params - query parameters for the search
 */
async function drugbank_post(route, api_key, body, params) {
    
    return axios.post(DRUGBANK_API + route, body, {
        headers: drugbank_headers(api_key),
        params: params
    })
    .then(response => {
        return response;
    })
    .catch(error => {
        console.log(error.response.data.error)
        return error.response;
    })  

}

// DrugBank headers that need to be set. Needs to be sent with any request to the 
// DrugBank API as it contains the API authorization key, which validates access.
function drugbank_headers(api_key) {
    return {
        "Authorization": api_key,
        "Content-Type": "application/json",
        "Accept": "application/json"
    };
}
