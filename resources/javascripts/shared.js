/**  
 * NOTE: The localhost needs to be replaced with the url of the web service
 * being used to access the DrugBank API, and the urls and parameters
 * in the AJAX calls below will need to be updated accordingly.
 * This example app assumes the request urls are sent to the included locally hosted server. 
 */

/**
 * Shared variables. 
 * These varaibles are all needed for almost every section,they are 
 * delcared and set in this file (which is used by every section). They
 * NEED to be intialized so that initializng the select2's works properly.
 */ 
var localhost = "/api/"; // for connecting to the locally hosted server
var api_host = ""; // where the local server sends the request (DrugBank API)
var region = ""; // string that can be "us", "ca", "eu", or empty (which searches all regions)
var api_key = "";

highlight_name = function(concept) {
    var name = concept.name;
    concept.hits.forEach(function(h) {
        name = name.replace(strip_em_tags(h.value), h.value);
    });
    return name;
};

strip_em_tags = function(text) {
    return text.replace(/<\/?em>/g, "");
};

em_to_u_tags = function(text) {
    text = text.replace("<em>", "<u>").replace("</em>", "</u>");
    if (text.includes("<em>")) {
        return em_to_u_tags(text);
    } else {
        return text;
    }
};

clearTableResults = function(table) {
    table.clear().draw();
};

// Display the API request and response on the page
displayRequest = function(url, data) {
    $(".http-request").html("GET " + url);
    $(".shell-command").html("curl -L '" + url + "' -H 'Authorization: mytoken'");
    $(".api-response").html(Prism.highlight(JSON.stringify((data), null, 2), Prism.languages.json));
};

handleError = function(jqXHR, element) {
    var message;
    if ((jqXHR.status && jqXHR.status === 0) || (jqXHR.statusText && jqXHR.statusText === 'abort')) {
        return;
    } else {
        $(element).val(null).trigger('change');
        try {
            if ($.parseJSON(jqXHR.responseText).errors) {
                message = $.parseJSON(jqXHR.responseText).errors.join();
            } else {
                message = jqXHR.responseText;
            }
        } catch (_error) {
            message = jqXHR.responseText || "Error accessing " + api_host;
        }
        return alert(message.replace(/(<([^>]+)>)/ig,"") + ". Please wait and try again or contact the DrugBank Team.");
    }
};

/**
 * Gets the config file from the server. Needed for the API host 
 * path and resolving the region to use. 
 */
getConfig = async function() {

    await $.ajax({
        url: encodeURI("config"),
        delay: 100,
        dataType: "json",
        success: function(data) {
            
            if (data["region"] != "") {
                data["region"] = data["region"] + "/";
            } 

            api_host = data["api-host"];
            region = data["region"];
            api_key = data["auth-key"]

        },
        error: function(jqXHR, textStatus, errorThrown) {
            handleError(jqXHR, ".drug_autocomplete");
        }
    });

};