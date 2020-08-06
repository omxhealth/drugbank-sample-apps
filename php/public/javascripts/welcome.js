/**
 * DrugBank API Sample App:
 * welcome.js
 * 
 * JavaScript that's run on the welcome page.
 * 
 * The code here is used for changing your API key and region, 
 * which is done by communication with the local server.
 * There is no code here that hits the DrugBank API.
 */

var api_key = getApiKey();
var region = $("main")[0].getAttribute("region"); // region should always be set

// If no API key was set or found, prompt for it to be entered with a popup
if (!api_key) {
    setupPopup(region);
    $("#welcomeModal").modal({keyboard: false});  

    // Get the updated API key and region and display them
    $("#welcomeModal").on("hide.bs.modal", function() {
        api_key = getApiKey();
        region = $("main")[0].getAttribute("region");
        $("#auth_key_input").attr("placeholder", api_key);
        $("#region_select").val(region);
    });

} else {
    // Get the API key and region and display them
    $("#auth_key_input").attr("placeholder", api_key);
    $("#region_select").val(region);
}

$(".db-logo").addClass("active");
navUnderlineSetup();

// Enable the tooltips
$('.tooltip-container').tooltip({container:".col-settings", html:true})

/**
 * Setting up the region select dropdown, which is a select2.
 * This is outside the $(document).ready() as it flickers
 * slightly as it changes from a regular select to a select2
 */
$("#region_select").select2({
    theme: "drugbank",
    minimumResultsForSearch: -1, // no search bar
    width: "resolve" 
});

// On region change, send the newly selected region to the server
$("#region_select").on("change", function() {
    return $.ajax({
        url: "/region",
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({
            region: encodeURI($("#region_select").val())
        }),
        dataType: "json" 
    });
});

// Prevent the enter key from submitting the form
$("#auth_key_form").keypress(
    function(event){
        if (event.which == '13') {
        event.preventDefault();
        }
    }
);

/**
 * API key update button.
 * On submission, send a JSON with the new key to the server.
 * The server processes the request, and returns a message and whether 
 * the key update was successful or not through http status code.
 */
$("#auth_key_submit").on("click", function(e) {
    
    e.preventDefault(); // Prevent form submission
    e.stopPropagation();

    return $.ajax({
        url: "/auth_key",
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({
            q: encodeURI($("#auth_key_input").val())
        }),
        dataType: "json",
        success: function(result){
            $("#auth_key_alert").fadeOut(100); // if an alert wasn't dismissed, hide it now
            $("#auth_key_input").attr("placeholder", result["updated-key"]); // put new key
            $("#auth_key_input").val(""); // empty the text input
            $("#auth_update_message").text((result)["message"]); // set message
            $("#auth_key_alert").removeClass("alert-warning"); // remove alert-warning class (makes yellow)
            $("#auth_key_alert").addClass("alert-success"); // add alert-success class (makes blue)
            $("#auth_key_alert").fadeIn(200); // bring in the alert
        },

        // An error is caused by either the new key being empty
        // or by being unable to open "config.json" to save
        error: function(xhr) {
            var result = JSON.parse(xhr.responseText);
            $("#auth_key_alert").fadeOut(100); // if an alert wasn't dismissed, hide it now
            $("#auth_key_input").attr("placeholder", result["original-key"]); // put original key
            $("#auth_key_input").val(""); // empty the text input
            $("#auth_update_message").text((result)["message"]); // set message
            $("#auth_key_alert").removeClass("alert-success"); // remove alert-success class (makes blue)
            $("#auth_key_alert").addClass("alert-warning"); // add alert-warning class (makes yellow)
            $("#auth_key_alert").fadeIn(200); // bring in the alert
        }

    });

});

/**
 * Function for hiding alert pop up when "x" is clicked as
 * opposed to the alert being completely removed from the DOM.
 * This allows for reuse of the alert.
 * Taken from https://stackoverflow.com/a/11029624/12471692.
 */   
$(function(){
    $("[data-hide]").on("click", function(){
        $(this).closest("." + $(this).attr("data-hide")).fadeOut(200);
    });
});
