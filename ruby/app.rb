require 'rubygems'
require 'bundler/setup'
require "sinatra"
require "httparty"
require "json"
require "haml"

$config_file = "../config.json"   

# Try to read in the config file. 
# If it doesn't exist, create it with default values.
if File.exist?($config_file)
  file = File.read $config_file
  $config = JSON.parse(file)

else  
  $config = {
    "port": "8080",
    "auth-key": "",
    "region": ""
  }

  # If created, the keys need to be converted to strings to work properly
  # (If values were read from the file initially, the keys are treated as strings)
  $config = $config.transform_keys(&:to_s) 

  File.write($config_file, JSON.pretty_generate($config))

end

# Set variables after reading in the config

set :public_folder, __dir__ + "/../resources"
set :views, settings.public_folder + "/templates/haml"
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

$drugbank_api = "https://api.drugbankplus.com/v1/"
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
  return res
end

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
def getApiRoute(endpoint)
  apiRoute = $drugbank_api + $drugbank_region

  if $drugbank_region != ""
    apiRoute = apiRoute + "/" 
  end    

  return apiRoute + endpoint

end

# Similar to getApiRoute(), but omits the api host. It
# returns the API endpoint with correct region attached
# for use with drugbank_get().
#
# endpoint: the API call type (product_concepts, ddi, etc)
def getApiEndpoint(endpoint)
    
  apiRegion = $drugbank_region

  if $drugbank_region != ""
    apiRegion = apiRegion + "/"
  end

  return apiRegion + endpoint

end   

# GET render: welcome page
get "/" do
  haml :welcome, :locals => {:region => $drugbank_region, :api_key => $drugbank_api_key}
end    

# GET render: product concepts page
get "/product_concepts" do
  route = getApiRoute("product_concepts")
  haml :product_concepts, :locals => {:api_route => route, :api_key => $drugbank_api_key, :region => $drugbank_region} 
end

# GET API call: product concepts
get "/api/product_concepts" do
  content_type :json
  route = getApiEndpoint("product_concepts")
  db_res = drugbank_get(route, params)
  [db_res.code, JSON.parse(db_res.body).to_json]
end

# GET API call: product concepts (x = DB ID, y = routes/strength)
get "/api/product_concepts/:x/:y" do
  content_type :json
  route = getApiEndpoint("product_concepts/" + params["x"] + "/" + params["y"])
  db_res = drugbank_get(route, params)
  [db_res.code, JSON.parse(db_res.body).to_json]
end

# GET render: drug-drug interaction (ddi) page
get "/ddi" do
  route = getApiRoute("ddi")
  haml :ddi, :locals => {:api_route => route, :api_key => $drugbank_api_key, :region => $drugbank_region}
end

# GET API call: ddi
get "/api/ddi" do
  content_type :json
  route = getApiEndpoint("ddi")
  db_res = drugbank_get(route, params)
  [db_res.code, JSON.parse(db_res.body).to_json]
end     

# GET render: indications page
get "/indications" do
  route = getApiRoute("indications")
  haml :indications, :locals => {:api_route => route, :api_key => $drugbank_api_key, :region => $drugbank_region}
end

# GET API call: indications
get "/api/indications" do
  content_type :json
  route = getApiEndpoint("indications")
  db_res = drugbank_get(route, params)
  [db_res.code, JSON.parse(db_res.body).to_json]
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

# Updates the api key by writing the new value to the config file.
# If anything goes wrong (file not found, IO exception),
# the old key is restored
# Returns the status code to be sent to the client (200 OK or 400 Bad Request)
def update_API_key(new_key)
    
  #get the old key
  old_key = $drugbank_api_key

  # update key
  $drugbank_api_key = new_key

  # update the local config
  $config["auth-key"] = new_key

  # try to write back to config file
  begin
    File.write($config_file, JSON.pretty_generate($config)) 
    $drugbank_headers["Authorization"] = new_key
    return 200    
  rescue StandardError => msg 
    # in case anything goes wrong, revert changes
    puts msg
    $config["auth-key"] = old_key
    $drugbank_api_key = old_key
    $drugbank_headers["Authorization"] = old_key
    return 400
  end    

end    

# Updates the region by writing the new value to the config file.
# If anything goes wrong (file not found, IO exception),
# the old region is restored
# Returns the status code to be sent to the client (200 OK or 400 Bad Request)
def update_region(new_region)

  #get the old region
  old_region = $drugbank_region

  # update key
  $drugbank_region = new_region

  # update the local config
  $config["region"] = new_region

  # try to write back to config file
  begin
    File.write($config_file, JSON.pretty_generate($config)) 
    return 200    
  rescue StandardError => msg 
    # in case anything goes wrong, revert changes
    puts msg
    $config["region"] = old_region
    $drugbank_region = old_region
    return 400
  end    

end    
   