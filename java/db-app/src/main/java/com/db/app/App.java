package com.db.app;

import static spark.Spark.*;
import spark.ModelAndView;
import spark.Request;

import static spark.debug.DebugScreen.enableDebugScreen;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import org.json.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class App {

    protected static String authKey = "";
    protected static String apiHost = "https://api.drugbankplus.com/v1/";
    protected static String region = "";
    protected static JSONObject config;

    private static final Logger logger = LogManager.getLogger(App.class);

    // if config file name or location is changed, also needs to change in pom.xml
    protected static final String configFile = "config.json";

    /**
     * NOTE: the static path is set realtive to the directory where the server is being
     * called from. So if run from the "drugbank-sample-apps" folder, the static path
     * is "resources", but if run from in the "db-app" folder, the static path is
     * "../../resource". This can hopefully be changed so it doesn't matter.
     */
    protected static String staticPath = "../../resources";
    protected static String templatesPath = staticPath + "/templates/";

    public static void main(final String[] args) {

        // Load the config and setup the server
        config = loadConfig();
        setupServer(config);

        logger.info("API Host: " + apiHost);
        logger.info("Working Path: " + System.getProperty("user.dir").toString());

        // Template engine setup
        final JinjavaEngine engine = new JinjavaEngine(templatesPath);
        engine.setUseCache(false);

        redirect.get("/", "/support");

        /* Set product concepts routes */

        // GET render: product concepts page 
        get("/product_concepts", (req, res) -> {
            String route = getApiRoute("product_concepts");
            Map<String, Object> attributes = new HashMap<>();

			attributes.put("api_route", route);

            return engine.render( 
                new ModelAndView(attributes, "product_concepts.jinja")
            );
        });    

        // GET API call: product concepts
        get("/api/product_concepts", (req, res) -> {
            String route = getApiEndpoint("product_concepts");
            final Map<String, String> params = setParams(req);
            res.type("application/json");
            return api.drugbank_get(route, params).getData().toString();
        });

        // GET API call: product concepts (DB ID, routes/strength)
        get("/api/product_concepts/*/*", (req, res) -> {
            String route = getApiEndpoint(
                "product_concepts/" + req.splat()[0] + "/" + req.splat()[1]);
            final Map<String, String> params = setParams(req);
            res.type("application/json");
            return api.drugbank_get(route, params).getData().toString();
        });

        /* Set drug-drug interactions routes */

        // GET render: drug-drug interations (ddi) page 
        get("/ddi", (req, res) -> {
            String route = getApiRoute("ddi");
            Map<String, Object> attributes = new HashMap<>();

			attributes.put("api_route", route);

            return engine.render( 
                new ModelAndView(attributes, "ddi.jinja")
            );
        });    

        // GET API call: ddi
        get("/api/ddi", (req, res) -> {
            String route = getApiEndpoint("ddi");
            final Map<String, String> params = setParams(req);
            res.type("application/json");
            return api.drugbank_get(route, params).getData().toString();
        });

        /* Set indications routes */

        // GET render: indications page 
        get("/indications", (req, res) -> {
            String route = getApiRoute("indications");
            Map<String, Object> attributes = new HashMap<>();

			attributes.put("api_route", route);

            return engine.render( 
                new ModelAndView(attributes, "indications.jinja")
            );
        });    

        // GET API call: indications
        get("/api/indications", (req, res) -> {
            String route = getApiEndpoint("indications");
            final Map<String, String> params = setParams(req);
            res.type("application/json");
            return api.drugbank_get(route, params).getData().toString();
        });

        /* Set support page routes */

        // GET render: support page
        get("/support", (req, res) -> {
            Map<String, Object> attributes = new HashMap<>();

            attributes.put("region", region);
            attributes.put("api_key", authKey);

            return engine.render( 
                new ModelAndView(attributes, "support.jinja")
            );
        });    

        // PUT: update API authorization key 
        put("/auth_key", (req, res) -> {

            final JSONObject JsonResponse = new JSONObject();
            logger.info("Received API key update request: " + req.body());

            final JSONObject JsonRequest = new JSONObject(req.body());
            final String newKey = JsonRequest.get("q").toString();

            res.type("application/json");

            JsonResponse.put("original-key", authKey);
            JsonResponse.put("updated-key", newKey);

            /**
             * if the new key is the same as the old one, dont bother updating it
             * 
             * else if the new key is empty, don't bother updating it 
             * (note: this shouldn't ever be an issue as an HTML form
             * won't submit if it is empty)
             * 
             * otherwise, try to update the key
             */
            if (authKey.equals(newKey)) {
                res.status(200);
                JsonResponse.put("message", "New key is the same as the old key");

            } else if (newKey.equals("")) {
                res.status(400);
                JsonResponse.put("message", "No key was provided");

            } else {

                String oldKey = authKey;

                try {
                    
                    // update local variables
                    authKey = newKey;
                    config.put("auth-key", authKey);
                    
                    updateConfig(config);

                    logger.info("Authentication updated: " + authKey);
                    
                    // update variables in api.java
                    api.DRUGBANK_API_KEY = authKey;
                    api.DRUGBANK_HEADERS.put("Authorization", authKey);

                    res.status(200);
                    JsonResponse.put("message", "Key successfully updated");

                } catch (final IOException e) {
                    e.printStackTrace();

                    // revert local variables
                    authKey = oldKey;
                    config.put("auth-key", oldKey);

                    // revert variables in api.java
                    api.DRUGBANK_API_KEY = oldKey;
                    api.DRUGBANK_HEADERS.put("Authorization", oldKey);

                    res.status(500);
                    JsonResponse.put("message", "Unable to update file '" + configFile + "'");
                }

            }

            return JsonResponse;

        });

        // PUT: update API authorization key 
        put("/region", (req, res) -> {

            final JSONObject JsonResponse = new JSONObject();
            logger.info("Received region update request: " + req.body());

            final JSONObject JsonRequest = new JSONObject(req.body());
            final String newRegion = JsonRequest.get("region").toString();

            res.type("application/json");

            /**
             * if the new region is the same as the old one, dont bother updating it
             * 
             * otherwise, try to update the region
             */
            if (region.equals(newRegion)) {
                res.status(200);
                JsonResponse.put("message", "New region is the same as the old region");

            } else {

                String oldRegion = region;

                try {
                    region = newRegion;
                    config.put("region", newRegion);
                    updateConfig(config);

                    logger.info("Region updated: " + region);

                    res.status(200);
                    JsonResponse.put("message", "Region successfully updated");

                } catch (final IOException e) {
                    e.printStackTrace();

                    region = oldRegion;
                    config.put("region", oldRegion);

                    res.status(500);
                    JsonResponse.put("message", "Unable to update file '" + configFile + "'");
                }

            }

            return JsonResponse;

        });

    }

    /**
     * Grabs the params from the given request and returns them as a Map.
     * 
     * @param req the request made
     * @return Map of the params
     */
    public static Map<String, String> setParams(final Request req) {
        final Map<String, String> params = new HashMap<String, String>();

        for (final String param : req.queryParams()) {
            params.put(param, req.queryParams(param));
        }

        return params;
    }

    /**
     * Loads properties from the config file into a JSONObject
     * 
     * The file must contain: - port: the port to host the server on - templates:
     * path to the template resources directory - static: path to the static
     * resources directory - api-host: the URL to the Drugbank API including the
     * version to be used ("https://api.drugbankplus.com/v1/") - auth-key:
     * authorization key for API access
     */
    public static JSONObject loadConfig() {

        InputStream in = App.class.getClassLoader().getResourceAsStream(configFile);
        StringBuilder content = new StringBuilder();

        try (Reader reader = new BufferedReader(
                new InputStreamReader(in, Charset.forName(StandardCharsets.UTF_8.name())))) {

            int c;
            while ((c = reader.read()) != -1) {
                content.append((char) c);
            }

        } catch (IOException e) {
            e.printStackTrace();
            throw new NullPointerException("Cannot find resource file '" + configFile + "'");
        }

        final JSONObject configObject = new JSONObject(content.toString());
        return configObject;

    }

    /**
     * Starts up the server based on the values in the config file.
     * 
     * @param config the config JSON
     */
    public static void setupServer(final JSONObject config) {

        staticFiles.externalLocation(staticPath);

        try {
            final int port = config.getInt("port");
            port(port);
            logger.info("Port: " + port);

        } catch (final Exception e) {
            logger.error("Cannot set port value", e);
        }

        try {
            authKey = config.getString("auth-key");
            logger.info("Authentication: " + authKey);
        } catch (final Exception e) {
            logger.error("No API key specified", e);
        }

        try {
            
            String regionFromConfig = config.getString("region").toLowerCase();

            /**
             * Check if the region found in the config file is valid.
             * Region can either be "us", "ca", "eu", or "" (for searching all regions).
             * If the region isn't any of the above, it will default to "" (all).
             */
            switch (regionFromConfig) {
                case "us":
                case "ca":
                case "eu":
                    config.put("region", regionFromConfig);
                    region = regionFromConfig;
                    break;
                default:
                    config.put("region", "");
                    region = "";
                    break;
            }

            logger.info("Region: " + region);

        } catch (final Exception e) {
            logger.error("No region specified", e);
        }

    }

    /**
     * Updates the config file by overwriting it with the locally stored config
     * JSONObject.
     * 
     * Called when an API key or region change request is made.
     */
    public static void updateConfig(final JSONObject config) throws IOException {
        final ObjectMapper mapper = new ObjectMapper();
        final Object json = mapper.readValue(config.toString(), Object.class);
        Files.write(Paths.get("../../" + configFile), mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(json));
    }

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
    public static String getApiRoute(String endpoint) {
        
        String apiRoute = apiHost + region;

        if (region != "") {
            apiRoute = apiRoute + "/";
        } 

        return apiRoute + endpoint;

    }

    /**
     * Similar to getApiRoute(), but omits the api host. It
     * returns the API endpoint with correct region attached
     * for use with drugbank_get().
     * 
     * @param {*} endpoint API call type (product_concepts, ddi, etc)
     */
    public static String getApiEndpoint(String endpoint) {
        
        String apiRegion = region;

        if (region != "") {
            apiRegion = apiRegion + "/";
        } 

        return apiRegion + endpoint;

    }

}
