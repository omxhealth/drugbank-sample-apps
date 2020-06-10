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
    protected static String apiHost = "";
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

        // Load config and setup the server
        config = loadConfig();
        setupServer(config);

        logger.info("Working Path: " + System.getProperty("user.dir").toString());

        // Template engine setup
        final JinjavaEngine engine = new JinjavaEngine(templatesPath);
        engine.setUseCache(false);

        redirect.get("/", "/product_concepts");

        /* Set product concepts routes */

        // GET render: product concepts page 
        get("/product_concepts", (req, res) -> 
                new ModelAndView(new HashMap<>(), "product_concepts.jinja"), engine);

        // GET API call: product concepts
        get("/api/product_concepts", (req, res) -> {
            final Map<String, String> params = setParams(req);
            res.type("application/json");
            return api.drugbank_get("product_concepts", params).getData().toString();
        });

        // GET API call: regional product concepts
        get("/api/*/product_concepts", (req, res) -> {
            final Map<String, String> params = setParams(req);
            res.type("application/json");
            return api.drugbank_get(req.splat()[0] + "/product_concepts", 
                    params).getData().toString();
        });

        // GET API call: product concepts (DB ID, routes/strength)
        get("/api/product_concepts/*/*", (req, res) -> {
            final Map<String, String> params = setParams(req);
            res.type("application/json");
            return api.drugbank_get("product_concepts/" + req.splat()[0] + 
                    "/" + req.splat()[1], params).getData().toString();
        });

        // GET API call: regional product concepts (DB ID, routes/strength)
        get("/api/*/product_concepts/*/*", (req, res) -> {
            final Map<String, String> params = setParams(req);
            res.type("application/json");
            return api.drugbank_get(req.splat()[0] + "/product_concepts/" + 
                    req.splat()[1] + "/" + req.splat()[2], params).getData().toString();
        });

        /* Set drug-drug interactions routes */

        // GET render: drug-drug interations (ddi) page 
        get("/ddi", (req, res) -> new ModelAndView(new HashMap<>(), "ddi.jinja"), engine);

        // GET API call: ddi
        get("/api/ddi", (req, res) -> {
            final Map<String, String> params = setParams(req);
            res.type("application/json");
            return api.drugbank_get("ddi", params).getData().toString();
        });

        // GET API call: regional ddi
        get("/api/*/ddi", (req, res) -> {
            final Map<String, String> params = setParams(req);
            res.type("application/json");
            return api.drugbank_get(req.splat()[0] + "/ddi", params).getData().toString();
        });

        /* Set indications routes */

        // GET render: indications page 
        get("/indications", (req, res) -> 
                new ModelAndView(new HashMap<>(), "indications.jinja"), engine);

        // GET API call: indications
        get("/api/indications", (req, res) -> {
            final Map<String, String> params = setParams(req);
            res.type("application/json");
            return api.drugbank_get("indications", params).getData().toString();
        });

        // GET API call: regional indications
        get("/api/*/indications", (req, res) -> {
            final Map<String, String> params = setParams(req);
            res.type("application/json");
            return api.drugbank_get(req.splat()[0] + "/indications", 
                    params).getData().toString();
        });

        /* Set support page routes */

        // GET render: support page
        get("/support", (req, res) -> 
                new ModelAndView(new HashMap<>(), "support.jinja"), engine);

        // GET: current API authorization key
        get("/auth_key", (req, res) -> {
            return authKey;
        });

        // PUT: update API authorization key 
        put("/auth_key", (req, res) -> {

            final JSONObject JsonResponse = new JSONObject();
            logger.info("Recieved API key update request: " + req.body());

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
                return JsonResponse;

            } else if (newKey.equals("")) {
                res.status(400);
                JsonResponse.put("message", "No key was provided");
                return JsonResponse;

            } else {

                try {
                    authKey = newKey;
                    config.put("auth-key", authKey);
                    updateConfig(config);

                    logger.info("Authentication updated: " + authKey);

                    res.status(200);
                    JsonResponse.put("message", "Key successfully updated");
                    return JsonResponse;

                } catch (final IOException e) {
                    e.printStackTrace();
                    res.status(500);
                    JsonResponse.put("message", "Unable to update file '" + configFile + "'");
                    return JsonResponse;
                }

            }

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
            apiHost = config.getString("api-host");

            // if the URL to the API is missing
            // the last slash, put it at the end
            if (!apiHost.substring(apiHost.length() - 1).equals("/")) {
                apiHost = apiHost + "/";
            }

            logger.info("API Host: " + apiHost);

        } catch (final Exception e) {
            logger.error("No host specified", e);
        }

        try {
            authKey = config.getString("auth-key");
            logger.info("Authentication: " + authKey);
        } catch (final Exception e) {
            logger.error("No API key specified", e);
        }

    }

    /**
     * Updates the config file by overwriting it with the locally stored config
     * JSONObject.
     * 
     * Called when an API auth key change request is made.
     */
    public static void updateConfig(final JSONObject config) throws IOException {
        final ObjectMapper mapper = new ObjectMapper();
        final Object json = mapper.readValue(config.toString(), Object.class);
        Files.write(Paths.get(configFile), mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(json));
    }

}
