require "sinatra"
require "httparty"
require "json"

set :public_folder, __dir__ + "/../resources"

file = File.read "../config.json"
config = JSON.parse(file)

DRUGBANK_API = config["api-host"]
DRUGBANK_API_KEY = config["auth-key"]
DRUGBANK_HEADERS = {
    "Authorization": DRUGBANK_API_KEY,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def drugbank_get(route, params)
    url = DRUGBANK_API + route
    res = HTTParty.get(url, :query => params, :headers => DRUGBANK_HEADERS)
    return JSON.parse(res.body)
end

