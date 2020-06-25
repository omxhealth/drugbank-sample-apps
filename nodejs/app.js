const path = require("path");
const fs = require("fs");
const axios = require("axios").default; // promise based HTTP client
const express = require("express"); // web framework 
const nunjucks = require("nunjucks"); // a templating engine similar to jinja2

const config_file = "config.json"; // the name of the config file

/* App Initialization */

// Initialize the Express app to read JSON and set the static files path
const app = express();
app.use(express.json());
app.use(express.static("../resources"));

// Configure nunjucks and set the templates path
nunjucks.configure(path.join(__dirname, "../resources/templates"), {
    autoescape: true,
    express: app
});

// Open the config file
let config = openConfig("../" + config_file);

// Check and set valid region
validateRegion(config);

// Set variables from config
let port = config["port"]; // the port the server will be hosted on
let DRUGBANK_API = config["api-host"]; // the DrugBank API link
let DRUGBANK_REGION = config["region"]; // the region to get results from
let DRUGBANK_API_KEY = config["auth-key"]; // DrugBank API key

// DrugBank headers that need to be set. Needs to be sent with any request to the 
// DrugBank API as it contains the API authorization key, which validates access.
let DRUGBANK_HEADERS = 
    {
        "Authorization": DRUGBANK_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    };    

// Start the server    
app.listen(port, () => console.log(`App listening at http://localhost:${port}`)); 

app.get("/", function (req, res) {
    res.redirect("/product_concepts");
});

// GET config json
// Used to give the front-end access to the
// config file (for the API host and region)
app.get("/config", function (req, res) {
    res.json(config);
});

/* Set product concepts routes */   

// GET render: product concepts page    
app.get("/product_concepts", function (req, res) {
    res.render("product_concepts.jinja");
});  

// GET API call: product concepts
app.get("/api/product_concepts", async function (req, res) {
    let data = await drugbank_get("product_concepts", req.query);
    res.json(data);
});

// GET API call: regional product concepts
app.get("/api/:region/product_concepts", async function (req, res) {
    let data = await drugbank_get(req.params.region + "/product_concepts", req.query);
    res.json(data);
});

// GET API call: product concepts (x = DB ID, y = routes/strength)
app.get("/api/product_concepts/:x/:y", async function (req, res) {
    let data = await drugbank_get("product_concepts/" + req.params.x + "/" + 
        req.params.y, req.query);
    res.json(data);
});

// GET API call: regional product concepts (x = DB ID, y = routes/strength)
app.get("/api/:region/product_concepts/:x/:y", async function (req, res) {
    let data = await drugbank_get(req.params.region + "/product_concepts/" + 
        req.params.x + "/" + req.params.y, req.query);
    res.json(data);    
});

/* Set drug-drug interactions routes */

// GET render: drug-drug interations (ddi) page    
app.get("/ddi", function (req, res) {
    res.render("ddi.jinja");
});

// GET API call: ddi
app.get("/api/ddi", async function (req, res) {
    let data = await drugbank_get("ddi", req.query);
    res.json(data);
});

// GET API call: regional ddi
app.get("/api/:region/ddi", async function (req, res) {
    let data = await drugbank_get(req.params.region + "/ddi", req.query);
    res.json(data);
});

/* Set indications routes */

// GET render: indications page    
app.get("/indications", function (req, res) {
    res.render("indications.jinja");
});

// GET API call: indications
app.get("/api/indications", async function (req, res) {
    let data = await drugbank_get("indications", req.query);
    res.json(data);
});

// GET API call: regional indications
app.get("/api/:region/indications", async function (req, res) {
    let data = await drugbank_get(req.params.region + "/indications", req.query);
    res.json(data);
});

/* Set alternative drugs routes */

// GET render: alternative drugs page    
app.get("/alternative_drugs", function (req, res) {
    res.render("alternative_drugs.jinja");
});

/* Set support page routes */

// GET render: support page
app.get("/support", function (req, res) {
    res.render("support.jinja");
});

// PUT: update API authorization key 
app.put("/auth_key", function (req, res) {
    
    let json_response;
    let status;
    let message = "";
    
    let old_key = DRUGBANK_API_KEY;
    let new_key = req.body.q;

    if (new_key == old_key) {
        status = 200;
        message = "New key is the same as the old key";
    } else if (new_key == "") {
        status = 400;
        message = "No key was provided";
    } else {

        status = update_API_key(new_key, old_key);

        if (status == 200){
            message = "Key successfully updated";
        } else {
            message = "Unable to update file '" + config_file + "'";
        }
           
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
    
    let new_region = req.body.region;
    let json_response;
    let status = 200;
    let message = "";

    if (new_region == DRUGBANK_REGION) {
        message = "New region is the same as the old region";
    } else {
        status = update_region(new_region);

        if (status == 200){
            message = "Region successfully updated";
        } else {
            message = "Unable to update file '" + config_file + "'";
        }
    }

    json_response = {
        "message": message
    };

    res.status(status);
    res.json(json_response);

});

/**
 * Attempts to open the config file on the
 * provided relative path. If no file exists or the
 * file is unable to be opened, an error is logged
 * and the script terminates.
 * 
 * Returns a JSON object containing the values 
 * from the config file.
 */
function openConfig(path) {
    try {
        var config_data_in = fs.readFileSync(path);  
        var config = JSON.parse(config_data_in);
        return config;
    } catch (error) {
        console.log(error);
        return process.exit(1);
    }
}

/**
 * Checks that the region found in the config file is valid.
 * Region can either be "us", "ca", "eu", or "" (for searching all).
 * If the region isn't any of the above, it will default to "" (all).
 */
function validateRegion(config) {

    var region = config["region"].toLowerCase();

    switch (region) {
        case "us":
        case "ca":
        case "eu":
            config["region"] = region;
            break;
        default:
            config["region"] = "";
            break;
    }

}

/**
 * Makes a GET request to the DrugBank API with query parameters.
 * Uses axios to send the request, and returns the recieved JSON response.
 * @param {*} route - route into the Drugbank API
 * @param {*} params - query parameters for the search
 */
async function drugbank_get(route, params) {
    
    return axios.get(DRUGBANK_API + route, {
        headers: DRUGBANK_HEADERS,
        params: params
    })
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.log(error.response.data.error)
        return error.response.data;
    })  

}

/**
 * Updates the auth key by writing the new value to the config file.
 * If anything goes wrong, the old key is restored.
 * Returns the status code to be sent to the client (200 OK or 500 Server Error)
 * @param {*} new_key 
 * @param {*} old_key 
 */
function update_API_key(new_key, old_key) {
    
    DRUGBANK_API_KEY = new_key;
    config["auth-key"] = new_key;

    // try to write back to config file
    try {
        fs.writeFileSync("../" + config_file, JSON.stringify(config, undefined, 2));
        DRUGBANK_HEADERS["Authorization"] = new_key;
        return 200;

    } catch (error) {
        // in case anything goes wrong, revert changes
        console.log(error);
        DRUGBANK_API_KEY = old_key;
        config["auth-key"] = old_key;
        DRUGBANK_HEADERS["Authorization"] = old_key;
        return 500
    }
    
}

/**
 * Updates the selected region by writing the new value to the config file.
 * If anything goes wrong, the old region is restored.
 * Returns the status code to be sent to the client (200 OK or 500 Server Error)
 * @param {*} new_region 
 */
function update_region(new_region) {

    let old_region = DRUGBANK_REGION;

    DRUGBANK_REGION = new_region;
    config["region"] = new_region;

    // try to write back to config file
    try {
        fs.writeFileSync("../" + config_file, JSON.stringify(config, undefined, 2));
        return 200;

    } catch (error) {
        // in case anything goes wrong, revert changes
        console.log(error);
        DRUGBANK_REGION = old_region;
        config["region"] = old_region;
        return 500
    }
}
