<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Slim\Views\Twig;
use Slim\Views\TwigMiddleware;
use GuzzleHttp\Client;
use Twig\TwigFilter;


require __DIR__ . "/../vendor/autoload.php";

// To help the built-in PHP dev server, check if the request was actually for
// something which should probably be served as a static file.
// If this isn"t here, CSS and Javascript won"t be loaded for the pages.
if (PHP_SAPI == "cli-server") {
    $_SERVER["SCRIPT_NAME"] = basename(__FILE__);
    $url  = parse_url($_SERVER["REQUEST_URI"]);
    $file = __DIR__ . $url["path"];
    if (is_file($file)) {
        return false;
    }
}

// The name of the config file
$config_file = "config.json";

// The location of the config file
$config_path = __DIR__ . "/../../" . $config_file;

if (file_exists($config_path)) {
    $file = fopen($config_path, "r");
    $read_file = fread($file, filesize($config_path));
    fclose($file);
    $config = json_decode($read_file, true);
} else {
    $config = [
        "port" => "8080",
        "auth-key" => "",
        "region" => ""
    ];

    $config_string = json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $file = fopen($config_path, "w");
    fwrite($file, $config_string);
    fclose($file);
}

// Check and set valid region
validate_region($config);

// Set variables after reading in the config
$DRUGBANK_API = "https://api.drugbankplus.com/v1/";
$DRUGBANK_API_KEY = $config["auth-key"];
$DRUGBANK_REGION = $config["region"];
$DRUGBANK_HEADERS = [
    "Authorization" => $DRUGBANK_API_KEY,
    "Content-Type" => "application/json",
    "Accept" => "application/json"
];

# Makes a GET request to the DrugBank API with query parameters
function drugbank_get($route, $params) {

    global $DRUGBANK_API, $DRUGBANK_HEADERS;

    $client = new Client([
        "base_uri" => $DRUGBANK_API,
        "headers" => $DRUGBANK_HEADERS,
        "query" => $params,
        "verify" => false
    ]);

    $response = $client->request("GET", $route);

    return $response->getBody()->getContents();

};

// Create App
$app = AppFactory::create();

// Create Twig
// Uses the jinja templates as twig is similar enough for them to work
$twig = Twig::create("../resources/templates", ["cache" => false]);

// Add the filter for the indications page to convert the section names
// to lowercase and underscored values for when added to the query.
$filter = new TwigFilter("indication_option", function ($name) { 
    $filtered = strtolower($name);
    $filtered = str_replace(" ", "_", $filtered);
    return $filtered;
});

$twig->getEnvironment()->addFilter($filter);

// Add Twig-View Middleware
$app->add(TwigMiddleware::create($app, $twig));

// Add middleware to parse HTTP request bodies
$app->addBodyParsingMiddleware();

// GET render: welcome page
$app->get("/", function (Request $request, Response $response) {

    global $DRUGBANK_REGION, $DRUGBANK_API_KEY;

    $view = Twig::fromRequest($request);
    return $view->render($response, "welcome.jinja", array(
        "region" => $DRUGBANK_REGION,
        "api_key" => $DRUGBANK_API_KEY
    ));

});

// GET render: product concepts page
$app->get("/product_concepts", function (Request $request, Response $response) {
    global $DRUGBANK_API_KEY, $DRUGBANK_REGION;
    $route = getApiRoute("product_concepts");
    $view = Twig::fromRequest($request);
    return $view->render($response, "product_concepts.jinja", array(
        "api_route" => $route,
        "api_key" => $DRUGBANK_API_KEY,
        "region" => $DRUGBANK_REGION
    ));
});

// GET API call: product concepts
$app->get("/api/product_concepts", function (Request $request, Response $response) {
    $route = getApiEndpoint("product_concepts");
    $payload = drugbank_get($route, $request->getQueryParams());
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// GET API call: product concepts (x = DB ID, y = routes/strength)
$app->get("/api/product_concepts/{x}/{y}", 
        function (Request $request, Response $response, $args) {
    $route = getApiEndpoint("product_concepts/" . $args["x"] . "/" . $args["y"]);        
    $payload = drugbank_get($route, $request->getQueryParams());
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// GET render: ddi page
$app->get("/ddi", function (Request $request, Response $response) {
    global $DRUGBANK_API_KEY, $DRUGBANK_REGION;
    $route = getApiRoute("ddi");
    $view = Twig::fromRequest($request);
    return $view->render($response, "ddi.jinja", array(
        "api_route" => $route,
        "api_key" => $DRUGBANK_API_KEY,
        "region" => $DRUGBANK_REGION
    ));
});

// GET API call: ddi
$app->get("/api/ddi", function (Request $request, Response $response) {
    $route = getApiEndpoint("ddi");
    $payload = drugbank_get($route, $request->getQueryParams());
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// GET render: indications page
$app->get("/indications", function (Request $request, Response $response) {
    global $DRUGBANK_API_KEY, $DRUGBANK_REGION;
    $route = getApiRoute("indications");
    $view = Twig::fromRequest($request);
    return $view->render($response, "indications.jinja", array(
        "api_route" => $route,
        "api_key" => $DRUGBANK_API_KEY,
        "region" => $DRUGBANK_REGION,
        "app" => "php"));
});

// GET API call: indications
$app->get("/api/indications", function (Request $request, Response $response) {
    $route = getApiEndpoint("indications");
    $payload = drugbank_get($route, $request->getQueryParams());
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// PUT: update API authorization key
$app->put("/auth_key", function (Request $request, Response $response) {
    global $DRUGBANK_API_KEY, $config_file;

    $status = 200;
    $message = "";
    $old_key = $DRUGBANK_API_KEY;
    $json_request = $request->getParsedBody();
    $new_key = $json_request["q"];

    if ($old_key == $new_key) {
        $message = "New key is the same as the old key";

    } else if ($new_key == "") {
        $status = 400;
        $message = "No key was provided";

    } else {
        $status = update_API_key($new_key);

        if ($status == 200) {
            $message = "Key successfully updated";
        } else {
            $message = "Unable to update file '$config_file' ";
        }
    }

    $json_response = json_encode([
        "original-key" => $old_key,
        "updated-key" => $new_key,
        "message" => $message
    ]);

    $response->getBody()->write($json_response);
    $response = $response->withStatus($status);
    return $response->withHeader("Content-Type", "application/json");
});

// PUT: update API authorization key
$app->put("/region", function (Request $request, Response $response) {
    global $DRUGBANK_REGION, $config_file;

    $status = 200;
    $message = "";
    $old_region = $DRUGBANK_REGION;
    $json_request = $request->getParsedBody();
    $new_region = $json_request["region"];

    if ($old_region == $new_region) {
        $message = "New region is the same as the old region";

    } else {
        $status = update_region($new_region);

        if ($status == 200) {
            $message = "Region successfully updated";
        } else {
            $message = "Unable to update file '$config_file' ";
        }
    }

    $json_response = json_encode([
        "message" => $message
    ]);

    $response->getBody()->write($json_response);
    $response = $response->withStatus($status);
    return $response->withHeader("Content-Type", "application/json");
});

/**
 * Creates the url needed for accessing the actual DrugBank API directly.
 * Used for display in the API demo part of the app. The url get embedded into
 * template, and is accessed on the client side. Needed mainly to insert
 * the region correctly into the url. 
 * 
 * If the region is "" (all), then the api 
 * host and endpoint with no region is returned 
 * (https://api.drugbankplus.com/v1/product_concepts).
 * 
 * If a region like "us" is being used, then it appends to the api host the 
 * region and a "/" before the endpoint 
 * (https://api.drugbankplus.com/v1/us/product_concepts).
 * 
 * @param {*} endpoint API call type (product_concepts, ddi, etc)
 */
function getApiRoute($endpoint) {
    
    global $DRUGBANK_API, $DRUGBANK_REGION;

    $apiRoute = $DRUGBANK_API . $DRUGBANK_REGION;

    if ($DRUGBANK_REGION != "") {
        $apiRoute = $apiRoute . "/";
    } 

    return $apiRoute . $endpoint;

}

/**
 * Similar to getApiRoute(), but omits the api host. It
 * returns the API endpoint with correct region attached
 * for use with drugbank_get().
 * 
 * @param {*} endpoint API call type (product_concepts, ddi, etc)
 */
function getApiEndpoint($endpoint) {
    
    global $DRUGBANK_REGION;

    $apiRegion = $DRUGBANK_REGION;

    if ($DRUGBANK_REGION != "") {
        $apiRegion = $apiRegion . "/";
    } 

    return $apiRegion . $endpoint;

}

/**
 * Updates the auth key by writing the new value to the config file.
 * If anything goes wrong (file not found, IO exception),
 * the old key is restored
 * Returns the status code to be sent to the client (200 OK or 500 Server Error)
 */
function update_API_key($new_key) {
    
    global $DRUGBANK_API_KEY, $config, $config_file;

    // get the current key
    $old_key = $DRUGBANK_API_KEY;

    // update key
    $DRUGBANK_API_KEY = $new_key;

    // update config file
    $config["auth-key"] = $new_key;

    // try to write back to config file
    try {
        $config_string = json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $file = fopen(__DIR__ . "/../../" . $config_file, "w");
        fwrite($file, $config_string);
        fclose($file);
        $DRUGBANK_HEADERS["Authorization"] = $new_key;
        return 200;

    } catch (Exception $e) {
        // in case anything goes wrong, revert changes
        $config["auth-key"] = $old_key;
        $DRUGBANK_HEADERS["Authorization"] = $old_key;
        return 500;
    }

}

/**
 * Updates the auth key by writing the new value to the config file.
 * If anything goes wrong (file not found, IO exception),
 * the old key is restored
 * Returns the status code to be sent to the client (200 OK or 500 Server Error)
 */
function update_region($new_region) {
    
    global $DRUGBANK_REGION, $config, $config_file;

    // get the current region
    $old_region = $DRUGBANK_REGION;

    // update region
    $DRUGBANK_REGION = $new_region;

    // update local config
    $config["region"] = $new_region;

    // try to write back to config file
    try {
        $config_string = json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $file = fopen(__DIR__ . "/../../" . $config_file, "w");
        fwrite($file, $config_string);
        fclose($file);
        return 200;

    } catch (Exception $e) {
        // in case anything goes wrong, revert changes
        $DRUGBANK_REGION = $old_region;
        $config["region"] = $old_region;
        return 500;
    }

}

/**
 * Checks that the region found in the config file is valid.
 * Region can either be "us", "ca", "eu", or "" (for searching all).
 * If the region isn't any of the above, it will default to "" (all).
 */
function validate_region($config) {
    $region = strtolower($config["region"]);

    switch ($region) {
        case "us":
        case "ca":
        case "eu":
            $config["region"] = $region;
            break;
        default:
            $config["region"] = "";
            break;
    }
}

// Run app
$app->run();