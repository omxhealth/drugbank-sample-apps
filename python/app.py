from flask import Flask, render_template, request, Response, jsonify, make_response, redirect
from json import JSONDecodeError
import json
import requests
import sys

app = Flask(__name__,
            template_folder="../resources/templates",
            static_url_path="",
            static_folder="../resources")

# The name of the config file
config_file = "config.json"

# Try opening the config JSON
try:
    config = json.load(open("../" + config_file))  # Store it as a dictionary   
except FileNotFoundError:
    print("Creating file ../" + config_file + " with default values")
    config = {
        "port": "8080",
        "auth-key": "",
        "region": ""
    }

    json_file = open("../" + config_file, "w", encoding="utf-8")
    json.dump(config, json_file, indent=4)
    json_file.flush()


# Checks that the region found in the config file is valid.
# Region can either be "us", "ca", "eu", or "" (for searching all).
# If the region isn't any of the above, it will default to "" (all).
# Needs to be defined before it is first used.
def validate_region(config):

    accepted_regions = {"us", "ca", "eu"}
    region = config["region"].lower()

    if region in accepted_regions:
        config["region"] = region
    else:
        config["region"] = ""


# Check and set valid region
validate_region(config)

# Set variables after reading in the config.
# Note that not all delcarations may remain constant.
DRUGBANK_API = "https://api.drugbankplus.com/v1/"
DRUGBANK_API_KEY = config["auth-key"]
DRUGBANK_REGION = config["region"]
DRUGBANK_HEADERS = {
    "Authorization": DRUGBANK_API_KEY,
    "Content-Type": "application/json",
    "Accept": "application/json"
}


# Functions #


# Makes a GET request to the DrugBank API with query parameters
def drugbank_get(route, params):
    url = DRUGBANK_API + route
    res = requests.get(url, params=params, headers=DRUGBANK_HEADERS)
    return res.json()


# Creates the url needed for accessing the actual DrugBank API directly.
# Used for display in the API demo part of the app. The url get embedded into
# template, and is accessed on the client side. Needed mainly to insert
# the region correctly into the url.
#
# If the region is "" (all), then the api
# host and endpoint with no region is returned
# (https://api.drugbankplus.com/v1/product_concepts).
#
# If a region like "us" is being used, then it appends to the api host the
# region and a "/" before the endpoint
# (https://api.drugbankplus.com/v1/us/product_concepts).
#
# endpoint: the API call type (product_concepts, ddi, etc)
def getApiRoute(endpoint):

    apiRoute = DRUGBANK_API + DRUGBANK_REGION

    if DRUGBANK_REGION != "":
        apiRoute = apiRoute + "/"

    return apiRoute + endpoint


# Similar to getApiRoute(), but omits the api host. It
# returns the API endpoint with correct region attached
# for use with drugbank_get().
# endpoint:  the API call type (product_concepts, ddi, etc)
def getApiEndpoint(endpoint):

    apiRegion = DRUGBANK_REGION

    if DRUGBANK_REGION != "":
        apiRegion = apiRegion + "/"

    return apiRegion + endpoint


# Updates the auth key by writing the new value to the config file.
# If anything goes wrong (file not found, IO exception),
# the old key is restored
# Returns the status code to be sent to the client (200 OK or 500 Server Error)
def update_API_key(new_key):

    global DRUGBANK_API_KEY

    # get the current key
    old_key = DRUGBANK_API_KEY

    # update key
    DRUGBANK_API_KEY = new_key

    # update config file
    config["auth-key"] = new_key

    # try to write back to config file
    try:
        json_file = open("../" + config_file, "w", encoding="utf-8")
        json.dump(config, json_file, indent=4)
        json_file.flush()
        DRUGBANK_HEADERS["Authorization"] = new_key
        return 200

    except (FileNotFoundError, IOError):
        # in case anything goes wrong, revert changes
        DRUGBANK_API_KEY = old_key
        config["auth-key"] = old_key
        DRUGBANK_HEADERS["Authorization"] = old_key
        return 500


# Updates the selected region by writing the new value to the config file.
# If anything goes wrong, the old region is restored.
# Returns the status code to be sent to the client (200 OK or 500 Server Error)
def update_region(new_region):

    global DRUGBANK_REGION

    # get the current region
    old_region = DRUGBANK_REGION

    # update region
    DRUGBANK_REGION = new_region

    # update config file
    config["region"] = new_region

    # try to write back to config file
    try:
        json_file = open("../" + config_file, "w", encoding="utf-8")
        json.dump(config, json_file, indent=4)
        json_file.flush()
        return 200

    except (FileNotFoundError, IOError):
        # in case anything goes wrong, revert changes
        DRUGBANK_REGION = old_region
        config["region"] = old_region
        return 500


# Routes #


@app.route("/", methods=["GET"])
def welcome_page():
    return render_template("welcome.jinja", api_key=DRUGBANK_API_KEY, region=DRUGBANK_REGION)


# GET render: product concepts page
@app.route("/product_concepts", methods=["GET"])
def product_concepts_page():
    route = getApiRoute("product_concepts")
    return render_template("product_concepts.jinja", api_route=route, api_key=DRUGBANK_API_KEY, region=DRUGBANK_REGION)


# GET API call: product concepts
@app.route("/api/product_concepts", methods=["GET"])
def api_product_concepts():
    route = getApiEndpoint("product_concepts")
    res = drugbank_get(route, request.args)
    return jsonify(res)


# GET API call: product concepts (x = DB ID, y = routes/strength)
@app.route("/api/product_concepts/<x>/<y>", methods=["GET"])
def api_product_concepts_vars(x, y):
    route = getApiEndpoint("product_concepts/" + x + "/" + y)
    res = drugbank_get(route, request.args)
    return jsonify(res)


# GET render: drug-drug interaction (ddi) page
@app.route("/ddi", methods=["GET"])
def ddi_page():
    route = getApiRoute("ddi")
    return render_template("ddi.jinja", api_route=route, api_key=DRUGBANK_API_KEY, region=DRUGBANK_REGION)


# GET API call: ddi
@app.route("/api/ddi", methods=["GET"])
def api_ddi():
    route = getApiEndpoint("ddi")
    res = drugbank_get(route, request.args)
    return jsonify(res)


# GET render: indications page
@app.route("/indications", methods=["GET"])
def indications_page():
    route = getApiRoute("indications")
    return render_template("indications.jinja", app="python", api_route=route, api_key=DRUGBANK_API_KEY, region=DRUGBANK_REGION)


# GET API call: indications
@app.route("/api/indications", methods=["GET"])
def api_indications():
    route = getApiEndpoint("indications")
    res = drugbank_get(route, request.args)
    return jsonify(res)


# PUT: update the authorization key
@app.route("/auth_key", methods=["PUT"])
def put_auth_key():

    global DRUGBANK_API_KEY

    status = 200
    message = ""
    old_key = DRUGBANK_API_KEY
    json_request = json.loads(request.data)
    new_key = json_request["q"]

    if old_key == new_key:
        message = "New key is the same as the old key"

    elif new_key == "":
        status = 400
        message = "No key was provided"

    else:
        status = update_API_key(new_key)

        if status == 200:
            message = "Key successfully updated"
        else:
            message = "Unable to update file '" + \
                config_file + "'"

    json_response = json.dumps(
        {
            "original-key": old_key,
            "updated-key": new_key,
            "message": message
        })

    res = make_response(json_response)
    res.headers["Content-Type"] = "application/json"
    res.status_code = status
    return res


# PUT: update the region
@app.route("/region", methods=["PUT"])
def put_region():

    global DRUGBANK_REGION

    status = 200
    message = ""
    json_request = json.loads(request.data)
    new_region = json_request["region"]

    if new_region == DRUGBANK_REGION:
        message = "New region is the same as the old region"

    else:
        status = update_region(new_region)

        if status == 200:
            message = "Region successfully updated"
        else:
            message = "Unable to update file '" + config_file + "'"

    json_response = json.dumps(
        {
            "message": message
        })

    res = make_response(json_response)
    res.headers["Content-Type"] = "application/json"
    res.status_code = status
    return res


# Start the app
if __name__ == "__main__":
    app.run(debug=True, port=config["port"], use_reloader=False)
