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
 * path needed to access the local server, and getApiKey() is for grabbing your
 * API key and displaying it in the API demo and for the welcome page.
 */

var localhost = "/api/"; // for connecting to the locally hosted server

/**
 * Replaces the table search bar with a DrugBank themed one
 */
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
        var oTable = $('.dataTable').dataTable();
        oTable.fnFilter($(this).val());
    });

}

// Clears and hides the terms below the search bar.
// For use after the "reset search" button is clicked.
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
displayRequest = function(url, data, api_key) {
    $(".http-request").html("GET " + url);
    $(".shell-command").html("curl -L '" + url + "' -H 'Authorization: '" + api_key + "'");
    $(".api-response").html(Prism.highlight(JSON.stringify((data), null, 2), Prism.languages.json));
};

// Clear the API request and response display on the page
clearDisplayRequest = function() {
    $(".http-request").html(null);
    $(".shell-command").html(null);
    $(".api-response").html(null);
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
 * JavaScript for underlining menu items.
 * Credit: https://css-tricks.com/jquery-magicline-navigation
 */
navUnderlineSetup = function() {

    // First add the underline to the navbar
    $(".navbar-nav").append("<li id='magic-line'></li>");
   
    var $magicLine = $("#magic-line");
    var $el, leftPos, newWidth;

    // The not("#magic-line") is here because the console will through errors
    // if you hover over the magic line because it has no children
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

    // if the window is resized, the magic-line values 
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
// If not present, uses placeholder "mytoken"
getApiKey = function() {
    
    try {
        if ($("main")[0].getAttribute("api_key")) {
            return $("main")[0].getAttribute("api_key");
        } else {
            throw(err);
        }    
    } catch(err) {
        return ""
    }
    
}

// Adds the search icon to the search bar
addSearchIconToSelect = function() {
    $(".selectize-control").append(
        "<svg class=\"search-icon\">\
          <use xlink:href=\"images/svg-defs.svg#search-icon\" /> \
        </svg>"
    );
}

setupPopup = function(region) {

    $("#auth_key_input_popup").val(null);
    $("#region_select_popup").val(region);
    $(".confirm-button").attr("disabled", true);

    $("#region_select_popup").select2({
        theme: "drugbank",
        minimumResultsForSearch: -1, // no search bar
        width: "resolve" 
    });

    // Enable the tooltips
    $('.tooltip-container-popup').tooltip({container:".modal-body", html:true});

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
            $(".confirm-button").removeClass("confirm-button-disabled");
            $(".confirm-button").attr("disabled", false);
        } else {
            $(".confirm-button").addClass("confirm-button-disabled");
            $(".confirm-button").attr("disabled", true);
        }
    });

    // On region or auth key change, send the new values to the server
    $(".confirm-button").on("click", async function(event) {

        event.preventDefault(); // Prevent form submission
        event.stopPropagation();

        try {
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
                    } 
                }),
                
                // Send the auth key update
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
            ]);
            
            // Hide the popup after region and auth key successfully updated
            $("#welcomeModal").modal("hide")

        } catch(ex) { 
            handleError(jqXHR, ".drug_autocomplete");
        } 

    });

}
