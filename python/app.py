from flask import Flask, render_template, request, Response, jsonify, make_response
from json import JSONDecodeError
import json
import requests
import sys

app = Flask(__name__,
            template_folder = "../resources/templates",
            static_url_path = "",
            static_folder = "../resources")

# The name of the config file
config_file = "config.json"

# Try opening the config JSON
try:
    config = json.load(open("../" + config_file))  # Store it as a dictionary
except JSONDecodeError:
    print("Error: File does not appear to be a valid JSON document.")
    sys.exit()

# Set variables after reading in the config
DRUGBANK_API = config["api-host"]
DRUGBANK_API_KEY = config["auth-key"]
DRUGBANK_HEADERS = {
    "Authorization": DRUGBANK_API_KEY,
    "Content-Type": "application/json",
    "Accept": "application/json"
}


# Makes a GET request to the DrugBank API with query parameters
def drugbank_get(route, params):
    url = DRUGBANK_API + route
    res = requests.get(url, params=params, headers=DRUGBANK_HEADERS)
    return res.json()


# GET render: product concepts page
@app.route("/product_concepts", methods=["GET"])
def product_concepts_page():
    return render_template("product_concepts.html")


# GET API call: product concepts
@app.route("/api/product_concepts", methods=["GET"])
def api_product_concepts():
    res = drugbank_get("product_concepts", request.args)
    return jsonify(res)


# GET API call: regional product concepts
@app.route("/api/<region>/product_concepts", methods=["GET"])
def api_product_concepts_regional(region):
    res = drugbank_get(region + "/product_concepts", request.args)
    return jsonify(res)


# GET API call: product concepts (x = DB ID, y = routes/strength)
@app.route("/api/product_concepts/<x>/<y>", methods=["GET"])
def api_product_concepts_vars(x, y):
    res = drugbank_get("product_concepts/" + x + "/" + y, request.args)
    return jsonify(res)


# GET API call: regional product concepts (x = DB ID, y = routes/strength)
@app.route("/api/<region>/product_concepts/<x>/<y>", methods=["GET"])
def api_product_concepts_regional_vars(region, x, y):
    res = drugbank_get(region + "/product_concepts" +
                       x + "/" + y, request.args)
    return jsonify(res)


# GET render: drug-drug interaction (ddi) page
@app.route("/ddi", methods=["GET"])
def ddi_page():
    return render_template("ddi.html")


# GET API call: ddi
@app.route("/api/ddi", methods=["GET"])
def api_ddi():
    res = drugbank_get("ddi", request.args)
    return jsonify(res)


# GET API call: regional ddi
@app.route("/api/<region>/ddi", methods=["GET"])
def api_ddi_regional(region):
    res = drugbank_get(region + "/ddi", request.args)
    return jsonify(res)


# GET render: indications page
@app.route("/indications", methods=["GET"])
def indications_page():
    return render_template("indications.html")


# GET API call: indications
@app.route("/api/indications", methods=["GET"])
def api_indications():
    res = drugbank_get("indications", request.args)
    return jsonify(res)


# GET API call: regional indications
@app.route("/api/<region>/indications", methods=["GET"])
def api_indications_regional(region):
    res = drugbank_get(region + "/indications", request.args)
    return jsonify(res)


# GET render: support page
@app.route("/support", methods=["GET"])
def support_page():
    return render_template("support.html")


# GET: current API authorization key
@app.route("/auth_key", methods=["GET"])
def get_auth_key():
    return DRUGBANK_API_KEY


# PUT: update the authorization key
@app.route("/auth_key", methods=["PUT"])
def put_auth_key():

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
        status = update_API_key(new_key, old_key)

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


# Updates the auth key by writing the new value to the config file.
# If anything goes wrong (file not found, IO exception),
# the old key is restored
# Returns the status code to be sent to the client (200 OK or 500 Server Error)
def update_API_key(new_key, old_key):

    # update key
    DRUGBANK_API_KEY = new_key

    # update config file
    config["auth-key"] = new_key

    # try to write back to config file
    try:
        json_file = open("../" + config_file, "w", encoding="utf-8")
        json.dump(config, json_file, indent=4)
        DRUGBANK_HEADERS["Authorization"] = new_key
        return 200

    except (FileNotFoundError, IOError):
        # in case anything goes wrong, revert changes
        config["auth-key"] = old_key
        DRUGBANK_HEADERS["Authorization"] = old_key
        return 500


if __name__ == "__main__":
    app.run(debug=True, port=config["port"])
