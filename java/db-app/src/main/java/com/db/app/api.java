package com.db.app;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.net.ssl.HttpsURLConnection;
import org.json.*;

public class api {

    public static String DRUGBANK_API = App.apiHost;
    public static String DRUGBANK_API_KEY = App.authKey;
    public static Map<String, String> DRUGBANK_HEADERS = new HashMap<String, String>() {
        {
            put("Authorization", DRUGBANK_API_KEY);
            put("Content-Type", "application/json");
            put("Accept", "application/json");
        }
    };    

    /**
     * Creates the URL where the API call is to be sent to (no query parameters)
     */
    public static URL drugbank_url(String route) throws MalformedURLException {

        if (route.contains(DRUGBANK_API)) {
            return new URL(route);
        } else {
            return new URL(DRUGBANK_API + route);
        }
        
    }

    /**
     * Creates the URL where the API call is to be sent to (with query parameters)
     * Implemented from https://stackoverflow.com/a/26177982/12471692
     * @param route where to pull from
     * @param params the query parameters to the API
     * @return URL to the API with the given route and queries
     * @throws URISyntaxException
     * @throws MalformedURLException
     */
    public static URL drugbank_url(String route, Map<String, String> params) throws URISyntaxException,
            MalformedURLException {

        URI oldUri = new URI(DRUGBANK_API + route);
        StringBuilder queries = new StringBuilder();
        
        //add all the params to the request
        for (Map.Entry<String, String> query: params.entrySet()) {
            queries.append( "&" + query.getKey()+"="+query.getValue());
        }

        String newQuery = oldUri.getQuery();
        if (newQuery == null) {
            newQuery = queries.substring(1);
        } else {
            newQuery += queries.toString();
        }

        URI newUri = new URI(oldUri.getScheme(), oldUri.getAuthority(),
            oldUri.getPath(), newQuery, oldUri.getFragment());

        return newUri.toURL();
     
    }

    /**
     * Sets the request header for the connection.
     */
    public static void setHeader(HttpsURLConnection connection) {
        for (Map.Entry<String, String> entry: DRUGBANK_HEADERS.entrySet()) {
            connection.setRequestProperty(entry.getKey(), entry.getValue());;
        }
    }

    /**
     * Makes a GET request to the DrugBank API with no query parameters.
     * @param route: the url route
     * @return DBResponse
     * @throws IOException
     * @throws URISyntaxException
     */
    public static DBResponse drugbank_get(String route) throws IOException, URISyntaxException {
        return drugbank_get(route, null);
    }

    /**
     * Makes a GET request to the DrugBank API with query parameters.
     * @param route: the url route
     * @param params: url query parameters
     * @return DBResponse
     * @throws IOException
     * @throws URISyntaxException
     */
    public static DBResponse drugbank_get(String route, Map<String, String> params) throws IOException, URISyntaxException {

        int responseCode;
        URL url;
        DBResponse res;
        String readLine = "";

        if (params == null || params.isEmpty()) {
            url = drugbank_url(route);
        } else {
            url = drugbank_url(route, params);
        }
        
        HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();

        connection.setRequestMethod("GET");
        setHeader(connection);

        responseCode = connection.getResponseCode();

        if (responseCode == HttpsURLConnection.HTTP_OK) {
            BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuffer response = new StringBuffer();

            //read the call response into the stringbuffer
            while ((readLine = in.readLine()) != null) {
                response.append(readLine);
            }

            in.close();

            Map<String, List<String>> header = connection.getHeaderFields();
            
            if (response.toString().startsWith("[")) {
                JSONArray responseJSON = new JSONArray(response.toString());
                res = new DBResponse(responseJSON, header);
            } else {
                JSONObject responseJSON = new JSONObject(response.toString());
                res = new DBResponse(responseJSON, header);
            }
            
            return res;

        } else {
            throw new RuntimeException("Request Failed. Status Code: " + responseCode);
        }

    }

    /**
     * drug_names request example for tylenol (no params)
     * 
     * @throws URISyntaxException
     * @throws IOException
     */
    public static void drug_names_example() {
        
        DBResponse res;
        Map<String, String> params = new HashMap<String, String>() {
            {
                put("q", "tylenol");
            }
        };

        try {
            res = drugbank_get("drug_names", params);
            res.prettyPrintData();
        } catch (IOException | URISyntaxException e) {
            
            e.printStackTrace();
        }
        
    }

    /**
     * Drug-drug interaction (DDI) example. 
     * Gets interactions by Drugbank IDs.
     */
    public static void ddi_example() {
        
        DBResponse res;
        String[] drug_ids = new String[]{"DB01598", "DB01597", "DB12377", "DB01004"};
        Map<String, String> params = new HashMap<String, String>() {
            {
                put("drugbank_id", String.join(",", drug_ids));
            }
        };

        try {
            res = drugbank_get("ddi", params);
            res.prettyPrintData();
        } catch (IOException | URISyntaxException e) {
            e.printStackTrace();
        }

    }

    public static Object adverse_effects_paging_example() {
        
        try {
            DBResponse page1 = drugbank_get("drugs/DB00472/adverse_effects");
            DBResponse page2 = drugbank_get(page1.paginationNext().get("url").get(0).toString());
            JSONArray both = new JSONArray();

            for (int i = 0; i < ((JSONArray) page1.data).length(); i++) {
                both.put(((JSONArray) page1.data).get(i));
            }
            for (int i = 0; i < ((JSONArray) page2.data).length(); i++) {
                both.put(((JSONArray) page1.data).get(i));
            }

            return both; 

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        
    }
    
}

/**
 * Object that stores information from an API call:
 *  - JSON data returned from call
 *  - response header from call
 */
class DBResponse {

    Object data; //the JSON object or array returned from call
    Map<String, List<String>> response; //response header from the call
    boolean isObject; //used to check if the data stored is a JSONObject or JSONArray

    DBResponse(Object data, Map<String, List<String>> response) {
        
        if (data instanceof JSONObject) {
            this.isObject = true;
        } else if (data instanceof JSONArray) {
            this.isObject = false;
        } else {
            throw new IllegalArgumentException("Data provided is not an instance of a JSONObject or JSONArray");
        }
        
        this.data = data;
        this.response = response;
        
    }

    /**
     * Returns a boolean based on if the data JSON is an object or array.
     * @return
     */
    public boolean isObject() {
        return this.isObject();
    }

    public Map<String, List<String>> getResponse() {
        return response;
    }

    /**
     * Returns the data from the database response as an object.
     * Remember to cast to the correct type (JSONObject or JSONArray).
     * @return JSON object or array (as an Object)
     */
    public Object getData() {
        return data;
    }

    /**
     * Returns the link to the next page of the data.
     * Only applicable to requests that offer pagination.
     */
    public String getNextPageLink() {
        
        String header = this.response.get("Link").toString();

        if (header == null){
            return null;
        } else {
            return header;
        }

    }

    /**
     * Returns information on requests that offer pagination, with the follwoing structure: 
     * {
     *     page: '2',
     *     per_page: '50',
     *     rel: 'next',
     *     url: 'https://api.drugbankplus.com/v1/drugs/DB00472/adverse_effects?page=2&per_page=50'
     * }
     * 
     * Adapted from https://stackoverflow.com/a/5902142/12471692
     * 
     * @return 
     */
    public Map<String, List<String>> paginationNext() {
        try {
            
            Map<String, List<String>> params = new HashMap<String, List<String>>();
            String url = this.response.get("Link").toString().replaceAll(">; ", "&");
            
            if (url == null){
                return null;
            }

            url = url.replaceAll("[\\[\\]]|<|\"", "");
            String[] urlParts = url.split("\\?");

            if (urlParts.length > 1) {
                String query = urlParts[1];

                for (String param : query.split("&")) {
                    String[] pair = param.split("=");
                    String key = URLDecoder.decode(pair[0], "UTF-8");
                    String value = "";
                    
                    if (pair.length > 1) {
                        value = URLDecoder.decode(pair[1], "UTF-8");
                    }
    
                    List<String> values = params.get(key);
                    
                    if (values == null) {
                        values = new ArrayList<String>();
                        params.put(key, values);
                    }

                    values.add(value);

                }

                List<String> values = new ArrayList<String>();
                values.add(url.replaceAll("&rel[^.]*", ""));
                params.put("url", values);;
  
            }
    
            return params;

        } catch (UnsupportedEncodingException e) {
            throw new AssertionError(e);
        }

    }

    /**
     * Returns the total number of items matched by the request.
     */
    public int getTotalCount() {
        return Integer.parseInt(this.response.get("X-Total-Count").toString());
    }

    /**
     * Prints the response header to the terminal.
     */
    public void printResponse() {
        
        System.out.println("Response Header:");
        
        for (Map.Entry<String, List<String>> entry : this.response.entrySet()) {
            System.out.println("Key : " + entry.getKey() + " , Value : " + entry.getValue());
        }

    }

    /**
     * Prints the JSON data to the terminal.
     */
    public void prettyPrintData() {
        if (isObject){
            System.out.print(((JSONObject) data).toString(4));
        } else {
            System.out.print(((JSONArray) data).toString(4));
        }

    }

}
