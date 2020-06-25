require 'rubygems'
require 'bundler/setup'
require "sinatra"
require "httparty"
require "json"
require "haml"

# Read in the config JSON
file = File.read "../config.json"
$config = JSON.parse(file)

# Set variables after reading in the config

set :public_folder, __dir__ + "/../resources"
set :views, settings.public_folder + "/templates"
set :port, $config["port"]

# Checks that the region found in the config file is valid.
# Region can either be "us", "ca", "eu", or "" (for searching all).
# If the region isn't any of the above, it will default to "" (all)
def validate_region(config)

    $region = $config["region"].downcase

    case $region
        
        when "us", "ca", "eu"
            $config["region"] = $region
        else
            $config["region"] = ""
    end    

end 

validate_region($config)

$drugbank_api = $config["api-host"]
$drugbank_api_key = $config["auth-key"]
$drugbank_region = $config["region"]
$drugbank_headers = {
    "Authorization": $drugbank_api_key,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

# Makes a GET request to the DrugBank API with query parameters
def drugbank_get(route, params)
    url = $drugbank_api + route
    res = HTTParty.get(url, :query => params, :headers => $drugbank_headers)
    return JSON.parse(res.body)
end

get "/" do
    redirect "/product_concepts"
end   

get "/config" do
    content_type :json
    $config.to_json
end    

# GET render: product concepts page
get "/product_concepts" do
    haml :product_concepts
end

# GET API call: product concepts
get "/api/product_concepts" do
    content_type :json
    drugbank_get("product_concepts", params).to_json
end

# GET API call: regional product concepts
get "/api/:region/product_concepts" do
    content_type :json
    drugbank_get(params["region"] + "/product_concepts", params).to_json
end

# GET API call: product concepts (x = DB ID, y = routes/strength)
get "/api/product_concepts/:x/:y" do
    content_type :json
    route = "product_concepts/" + params["x"] + "/" + params["y"]
    drugbank_get(route, params).to_json
end

# GET API call: regional product concepts (x = DB ID, y = routes/strength)
get "/api/:region/product_concepts/:x/:y" do
    content_type :json
    route = params["region"] + "/product_concepts/" + params["x"] + "/" + params["y"]
    drugbank_get(route, params).to_json
end

# GET render: drug-drug interaction (ddi) page
get "/ddi" do
    haml :ddi
end

# GET API call: ddi
get "/api/ddi" do
    content_type :json
    drugbank_get("ddi", params).to_json
end    

# GET API call: regional ddi
get "/api/:region/ddi" do
    content_type :json
    route = params["region"] + "/ddi"
    drugbank_get(route, params).to_json
end    

# GET render: indications page
get "/indications" do
    haml :indications
end

# GET API call: indications
get "/api/indications" do
    content_type :json
    drugbank_get("indications", params).to_json
end 

# GET API call: regional indications
get "/api/:region/indications" do
    content_type :json
    route = params["region"] + "/indications"
    drugbank_get(route, params).to_json
end 

# GET render: support page
get "/support" do
    haml :support
end  

# PUT: update the authorization key
put "/auth_key" do

    content_type :json

    request.body.rewind
    json_request = JSON.parse request.body.read

    old_key = $drugbank_api_key
    new_key = json_request["q"]

    if old_key == new_key
        status_code = 200
        message = "New key is the same as the old key"

    elsif new_key == ""
        status_code = 400
        message = "No key was provided"

    else
        status_code = update_API_key(new_key)

        if status_code == 200
            message = "Key successfully updated"
        else
            message = "Unable to update config file"
        end

    end  
    
    json_response = {
        "original-key": old_key,
        "updated-key": new_key,
        "message": message
    }.to_json

    status status_code
    body json_response

end

# PUT: update region
put "/region" do

    content_type :json

    request.body.rewind
    json_request = JSON.parse request.body.read

    old_region = $drugbank_region
    new_region = json_request["region"]

    if old_region == new_region
        status_code = 200
        message = "New region is the same as the old region"

    else
        status_code = update_region(new_region)

        if status_code == 200
            message = "Region successfully updated"
        else
            message = "Unable to update config file"
        end

    end  
    
    json_response = {
        "message": message
    }.to_json

    status status_code
    body json_response

end

# Updates the auth key by writing the new value to the config file.
# If anything goes wrong (file not found, IO exception),
# the old key is restored
# Returns the status code to be sent to the client (200 OK or 500 Server Error)
def update_API_key(new_key)
    
    #get the old key
    old_key = $drugbank_api_key

    # update key
    $drugbank_api_key = new_key

    # update the local config
    $config["auth-key"] = new_key

    # try to write back to config file
    begin
        File.write("../config.json",JSON.pretty_generate($config)) 
        $drugbank_headers["Authorization"] = new_key
        return 200    
    rescue StandardError => msg 
        # in case anything goes wrong, revert changes
        puts msg
        $config["auth-key"] = old_key
        $drugbank_api_key = old_key
        $drugbank_headers["Authorization"] = old_key
        return 500
    end    

end    

# Updates the region by writing the new value to the config file.
# If anything goes wrong (file not found, IO exception),
# the old region is restored
# Returns the status code to be sent to the client (200 OK or 500 Server Error)
def update_region(new_region)

    #get the old region
    old_region = $drugbank_region

    # update key
    $drugbank_region = new_region
 
    # update the local config
    $config["region"] = new_region
 
    # try to write back to config file
    begin
        File.write("../config.json",JSON.pretty_generate($config)) 
        return 200    
    rescue StandardError => msg 
        # in case anything goes wrong, revert changes
        puts msg
        $config["region"] = old_region
        $drugbank_region = old_region
        return 500
    end    

end    
   