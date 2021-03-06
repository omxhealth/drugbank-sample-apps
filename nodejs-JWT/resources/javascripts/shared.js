/**
 * DrugBank API Sample App:
 * shared.js
 * 
 * Functions that are shared between multiple sections.
 * 
 * Most functions are for styling the pages (adding icons, 
 * changing how the table search bar looks, displaying/clearing
 * API info and search terms, navbar underline).
 * 
 * While no code here is used for the API, the variable "localhost" is for the
 * path needed to access the local server, and getJWT() is for generating a token
 * used for accessing the API.
 */

var host = "https://api-js.drugbankplus.com/v1/";

/**
 * Pull the region from the webpage, and appends a "/" if necessary
 * so that is can be easily concatenated with the host
 */
getRegion = function() {

    let region = $("main")[0].getAttribute("region");
    
    if ($("main")[0].getAttribute("region") != "") {
        region = $("main")[0].getAttribute("region") + "/";
    } 

    return region;

}

// Gets a JWT from the local server, and stores it in localStorage
getJWT = async function() {
    await $.ajax({
        url: "/new_token",
        success: function (data) {
            localStorage.setItem("token", data.token);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handleError(jqXHR, true);
        }

    });

}

// Gets the headers needed for the ajax call to the DrugBank API
getHeaders = function() {
    return {
        "Authorization": "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
}

// Replaces the table search bar with a DrugBank themed one.
restyleDatatableFilter = function() {
    
    // Replace and the search bar for the results table
    var tableSearchInput = 
        "<div class=\"input-group\"> \
            <input aria-controls=\"DataTables_Table_0\" placeholder=\"Search within results\" type=\"search\" id=\"example-search-input1\" class=\"form-control rounded-pill py-2 pr-5 mr-1\"> \
            <span class=\"input-group-append\"> \
                <div class=\"input-group-text border-0 bg-transparent ml-n5\"> \
                    <svg class=\"search-icon\">\
                        <use xlink:href=\"images/svg-defs.svg#search-icon\" /> \
                    </svg> \
                </div> \
            </span> \
        </div>";

    $(".dataTables_filter label").html(tableSearchInput);

    // To get the restyled search input to work, need to set any input
    // detected to call the filter function from datatables
    $(document).on('keyup', "input[type='search']", function(){
        var oTable = $('.dataTables_scrollBody .dataTable').dataTable();
        oTable.fnFilter($(this).val());  
    });

}

/**
 * Clears and hides the terms below the search bar.
 * For use after the "reset search" button is clicked.
 */
clearSearchTermsDisplay = function() {

    // Remove top margin for the group so the search bar is
    // vertically centered in its container
    $(".term-group").css("margin-top", "0");

    $(".term-group").children().each(function() {
        $(this).children().html(null);
        $(this).hide();
    })

}

clearTableResults = function(table) {
    table.clear().draw();
};

// Display the API request and response on the page
displayRequest = function(url, data, token) {
    $(".http-request").html("GET " + url);
    $(".shell-command").html("curl -L '" + url + "' -H 'Authorization: '" + token + "'");
    $(".api-response").html(Prism.highlight(JSON.stringify((data), null, 2), Prism.languages.json));
};

// Clear the API request and response display on the page
clearDisplayRequest = function() {
    $(".http-request").html(null);
    $(".shell-command").html(null);
    $(".api-response").html(null);
};

/**
 * If an error is returned from an API call, a popup with relevant 
 * information is displayed.
 * 
 * xhr contains all the information returned for the server (JSON response, 
 * status code, status message, etc).
 * 
 * triggerFunction is a boolean that determines how the page should be cleared:
 * Normally this is done by changing the drug autocomplete to null and triggering
 * a change manually, but some pages use Selectize.js selects for the drug
 * autocomplete, which needs to be triggered by calling the function that it
 * calls on change manually.
 */
handleError = async function(xhr, triggerFunction) {

    var error = "Error " + xhr.status + ": " + xhr.statusText;
    var message =  xhr.responseJSON.error;

    switch (xhr.status) {

        // 400 is returned when the region or API key are unable to be updated
        case 400:
            if (xhr.responseJSON.message) {
                message =  xhr.responseJSON.message;
            }
            break;
        
        // 401 is returned if the token or API key is invalid or if the endpoint is invalid    
        case 401:
            if (xhr.responseJSON.error == "Key invalid") {
                message += ", please change your API key.";
                $("#errorOk").text("Let's go!");
                $("#errorOk").on("click", function() {
                    window.location.href = "/"
                });
            } else if (xhr.responseJSON.error == "Token invalid") {
                await getJWT();
                return;
            }    
            break;  
        
        // 410 is returned if the resource requested has been removed the API servers 
        case 410:
            message += ". If you believe this is an error, please contact the DrugBank team."
            break;

        // 500 is returned if there is an internal server error    
        case 500:
            message += ". Please wait and try again or contact the DrugBank Team.";
            break;  
        
        // 503 is returned if the server is down for maintenance    
        case 503:
            message += ". Please wait and try again later.";
            break;     

        default:
            break;   

    }

    // Selectize.js selects can't have events triggered on them like how
    // Select2 selects can, so for them just call the function they'd call directly
    if (triggerFunction) {
        searchChange(null);
    } else {
        $(".drug_autocomplete").val(null).trigger("change");
    }

    $("#errorModalTitle").text(error);
    $("#errorModalMessage").html(message);
    $("#errorModal").modal();
    
}

/**
 * JavaScript for underlining menu items.
 * Credit: https://css-tricks.com/jquery-magicline-navigation
 */
navUnderlineSetup = function() {

    // First add the underline to the navbar
    $(".navbar-nav").append("<li id='magic-line'></li>");
   
    var $magicLine = $("#magic-line");
    var $el, leftPos, newWidth;

    // The not("#magic-line") is here because the console will throw errors
    // if you hover over the magic line itself because it has no children
    $(".db-logo, .navbar-nav li").not("#magic-line").hover(
        function() {
            $el = $(this).children();
            leftPos = $el.position().left;
            newWidth = $el.parent().width();
            $magicLine.stop().animate({
                left: leftPos,
                width: newWidth
            });
        },
        function() {
            $magicLine.stop().animate({
                left: $magicLine.data("origLeft"),
                width: $magicLine.data("origWidth")
            });
        }
    );
    
    navUnderlineMover(); // initial move into position

    // If the window is resized, the magic-line values 
    // need to be updated to work properly
    $(window).resize(navUnderlineMover);
    
};

/**
 * Moves the underline on nav items to the correct position.
 * Called on setup to get initial location, then called whenever
 * the window is resized.
 */
navUnderlineMover = function() {

    var posLeft;

    // Workaround for the nav brand, which is structured 
    // away from the rest of the nav items
    if ($(".db-logo").hasClass("active")) {
        posLeft = $(".active").position().left + parseInt($(".active").css('marginLeft'));
    } else {
        posLeft = $(".active a").position().left;
    }

    $("#magic-line")
        .width($(".active").children().width())
        .css("left", posLeft)
        .data("origLeft", $("#magic-line").position().left)
        .data("origWidth", $("#magic-line").width());   
} 

// Pulls the API key from the template for use in shell command display.
// If not present, returns empty string.
getApiKey = function() {
    
    try {
        return $("main")[0].getAttribute("api_key");
    } catch(err) {
        return ""
    }
    
}

/** 
 * Adds the search icon to the search bar.
 * Needs to be called after the search bar 
 * is initialized as a Selectize.js select box.
 */ 
addSearchIconToSelect = function() {
    $(".selectize-control").append(
        "<svg class=\"search-icon\">\
          <use xlink:href=\"images/svg-defs.svg#search-icon\" /> \
        </svg>"
    );
}

// Sets up the welcome popup if no API key was detected
setupPopup = function(region) {

    $("#auth_key_input_popup").val(null);
    $("#region_select_popup").val(region);
    $("#welcomeSubmit").attr("disabled", true);

    $("#region_select_popup").select2({
        theme: "drugbank",
        minimumResultsForSearch: -1, // no search bar
        width: "resolve" 
    });

    // Enable the tooltips
    $('.tooltip-container-popup').tooltip({container:"#welcomeModalBody", html:true});

    // Prevent the enter key from submitting the form
    $("#auth_key_form_popup").keypress(
        function(event){
            if (event.which == '13') {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    );

    $("#auth_key_input_popup").on("input", function() {
        if ($(this).val().length > 0) {
            $("#welcomeSubmit").removeClass("confirm-button-disabled");
            $("#welcomeSubmit").attr("disabled", false);
        } else {
            $("#welcomeSubmit").addClass("confirm-button-disabled");
            $("#welcomeSubmit").attr("disabled", true);
        }
    });

    $("#welcomeDismiss").on("click", function(event) {
        $("#welcomeModal").modal("hide");
        localStorage.setItem("first_time", false);
    });

    // On region or API key change, send the new values to the server
    $("#welcomeSubmit").on("click", async function(event) {

        event.preventDefault(); // Prevent form submission
        event.stopPropagation();

        await Promise.all([

            // Send region update
            $.ajax({
                url: "/region",
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify({
                    region: encodeURI($("#region_select_popup").val())
                }),
                dataType: "json",
                success: function() {
                    $("main")[0].setAttribute("region", $("#region_select_popup").val());
                }, 
                error: function(xhr) {
                    throw xhr;
                }
            }),
            
            // Send the api key update
            $.ajax({
                url: "/auth_key",
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify({
                    q: encodeURI($("#auth_key_input_popup").val())
                }),
                dataType: "json",
                success: function(){
                    $("main")[0].setAttribute("api_key", $("#auth_key_input_popup").val());
                }
            })
        ])
        .catch(function(xhr) {
            $("#welcomeModal").modal("hide");
            handleError(xhr, false);
        });
            
        // Hide the popup after region and api key successfully updated
        $("#welcomeModal").modal("hide");
        localStorage.setItem("first_time", false);

    });

}
