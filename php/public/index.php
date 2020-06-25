<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Slim\Views\Twig;
use Slim\Views\TwigMiddleware;
use GuzzleHttp\Client;

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

// Try opening the config and storing it
try {
    $file = fopen(__DIR__ . "/../../" . $config_file, "r") or die("Unable to open file!");
    $read_file = fread($file, filesize(__DIR__ . "/../../" . $config_file));
    fclose($file);
    $config = json_decode($read_file, true);
} catch (Exception $e) {
    echo "Caught exception: ",  $e->getMessage(), "\n";
    exit(1);
}

// Check and set valid region
validate_region($config);

// Set variables after reading in the config
$DRUGBANK_API = $config["api-host"];
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
$twig = Twig::create("../resources/templates", ["cache" => "./cache"]);

// Add Twig-View Middleware
$app->add(TwigMiddleware::create($app, $twig));

// Add middleware to parse HTTP request bodies
$app->addBodyParsingMiddleware();

$app->redirect("/", "/product_concepts");

// GET config
$app->get("/config", function (Request $request, Response $response) {
    global $config;
    $payload = json_encode($config);
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// GET render: product concepts page
$app->get("/product_concepts", function (Request $request, Response $response) {
    $view = Twig::fromRequest($request);
    return $view->render($response, "product_concepts.jinja");
});

// GET API call: product concepts
$app->get("/api/product_concepts", function (Request $request, Response $response) {
    $payload = drugbank_get("product_concepts", $request->getQueryParams());
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// GET API call: regional product concepts
$app->get("/api/{region}/product_concepts", 
        function (Request $request, Response $response, $args) {
    $payload = drugbank_get($args["region"] . "/product_concepts", $request->getQueryParams());
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// GET API call: product concepts (x = DB ID, y = routes/strength)
$app->get("/api/product_concepts/{x}/{y}", 
        function (Request $request, Response $response, $args) {
    $payload = drugbank_get("product_concepts/" . $args["x"] . "/" . $args["y"], $request->getQueryParams());
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// GET API call: product concepts (x = DB ID, y = routes/strength)
$app->get("/api/{region}/product_concepts/{x}/{y}", 
        function (Request $request, Response $response, $args) {
    $payload = drugbank_get($args["region"] . "/product_concepts/" . $args["x"] . "/" . $args["y"], $request->getQueryParams());
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// GET render: ddi page
$app->get("/ddi", function (Request $request, Response $response) {
    $view = Twig::fromRequest($request);
    return $view->render($response, "ddi.jinja");
});

// GET API call: ddi
$app->get("/api/ddi", function (Request $request, Response $response) {
    $payload = drugbank_get("ddi", $request->getQueryParams());
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// GET API call: regional ddi
$app->get("/api/{region}/ddi", function (Request $request, Response $response, $args) {
    $payload = drugbank_get($args["region"] . "/ddi", $request->getQueryParams());
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// GET render: indications page
$app->get("/indications", function (Request $request, Response $response) {
    $view = Twig::fromRequest($request);
    return $view->render($response, "indications.jinja");
});

// GET API call: indications
$app->get("/api/indications", function (Request $request, Response $response) {
    $payload = drugbank_get("indications", $request->getQueryParams());
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// GET API call: regional indications
$app->get("/api/{region}/indications", function (Request $request, Response $response, $args) {
    $payload = drugbank_get($args["region"] . "/indications", $request->getQueryParams());
    $response->getBody()->write($payload);
    return $response->withHeader("Content-Type", "application/json");
});

// GET render: support page
$app->get("/support", function (Request $request, Response $response) {
    $view = Twig::fromRequest($request);
    return $view->render($response, "support.jinja");
});

// GET: current API authorization key
$app->get("/auth_key", function (Request $request, Response $response) {
    global $DRUGBANK_API_KEY;
    $response->getBody()->write($DRUGBANK_API_KEY);
    return $response;
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