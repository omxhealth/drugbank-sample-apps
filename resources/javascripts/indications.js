/**
 * DrugBank API Sample App
 * indications.js
 * 
 * JavaScript that's run on the "Indications" section.
 * 
 * Most of the code here is just for functionality of the page.
 * Parts involved in calling the API include: 
 * 
 *  - submitting the request on clicking the search button: 
 *      $("button.search-button").on("click")
 */

var api_key;
var region;
var api_route = $("main")[0].attributes["api_route"].value;
var options = {};
var indications_table = $('.indications-table').DataTable({
    order: [[0, "asc"]],
    "columnDefs": [
        { className: "table_col_name", "targets": [0] } // bolds the first column text
    ]
});

/**
 * Indications Page Functions
 * 
 * Includes functions for loading results, 
 * and resetting the search.
 */

/**
 * Loads the results of the search into the table, then hides
 * the search area and displays the table. Also changes the 
 * search button function to reset the search (searchReset()).
 * 
 * @param {*} data the data obtained from the search ajax call
 */
loadResults = function (data) {

    loadTableResults(indications_table, data);

    $(".options-row").hide();
    $(".results-row").show();

    $(".search-button").addClass("search-button-reset");
    $(".search-button-text").html("Reset Search");
    
}

/**
 * Loads the results from the API response into the page's table.
 * Puts into the table the each hit's name, therapy type (kind), 
 * otc usage, and label usage.
 */
loadTableResults = function(indications_table, data) {
    
    // Empty the interactions table
    clearTableResults(indications_table);
    
    data.forEach(function(d) {
        var type = "Prescription"
        var label = "On-label";

        if (d.otc_use) {
            type = "OTC"
        }

        if (d.off_label) {
            label = "Off-label"
        }

        return indications_table.row.add([d.drug.name, options[d.kind], getUsage(d), type, label]);
    });

    return indications_table.draw();

};

 /**
 * Grabs the usages for a given hit from the API response.
 * Grabs data from the JSON response and returns it on a 
 * single line string for display in the table.
 * Used in loadTableResults().
 */
getUsage = function(indication) {
    var usages;
    usages = [];

    if (indication.process) {
      usages.push(indication.process.name);
    }
    if (indication.condition) {
      usages.push(indication.condition.name);
    }
    if (indication.therapy) {
      usages.push(indication.therapy.name);
    }

    return usages.join(", ");

};

/**
 * Displays the selected search filters for specificity, 
 * OTC use, and off-label below the search bar after a search is sent.
 * Goes through the term-group children in order by indexing from 0-2 (using eq()).
 */
showSearchTerms = function() {

    $(".term-group").css('margin-top', '10px'); // adds margin above terms for spacing

    // Display each div for the filters
    $(".term-group").children().each(function() {
        $(this).css('display', 'inline-block');
    })
    
    // Grab the text, and put it in the div.
    // The term group has three child divs, each with a 
    // child of it's own where the text needs to be put.
    // The text that is being grabbed comes from the divs 
    // AFTER the inputs in the HTML, so use next to access 
    // the correct element
    $(".term-group").children().eq(0).children().html(
        $("input[name='specificity']:checked").next().html()
    );
    $(".term-group").children().eq(1).children().html(
        $("input[name='otc_use']:checked").next().html()
    );
    $(".term-group").children().eq(2).children().html(
        $("input[name='off_label']:checked").next().html()
    );

}

/**
 * Resets the page after a search is performed by
 * clearing the results table, hiding it, clearing and hiding
 * the search terms below the search bar, clearing the search dropdowns,
 * and displaying the form selects again.
 */
searchReset = function() {

    $("#loader").show();

    // Uncheck all selected filters
    $(".kind-option").each(function() { 
        if ($(this).children("input").is(":checked")) {
            $(this).children("input").prop("checked", false);;
        }
    })

    $("#indication-name").prop("disabled", false);

    $("#indication-name").val(null);
    clearDisplayRequest();
    clearSearchTermsDisplay();
    
    $(".results-row").hide();
    $(".options-row").show();

    $(".search-button").removeClass("search-button-reset");
    $(".search-button").addClass("search-button-disabled");
    $(".search-button").attr("disabled", true);
    $(".search-button-text").html("Search");

    clearTableResults(indications_table);

    $("#loader").hide();

}  

/* End of functions */

/**
 * Initialization code for the page. 
 * Initializes parts like nav underline, 
 * and sets event listeners.
 * 
 * This could all go in $(document).ready(), but doing so 
 * causes the nav underline to flicker on page load,
 * and event listeners don't need to go in it.
 */

api_key = getApiKey();
region = $("main")[0].getAttribute("region"); // region should always be set

// If no API key was set or found, prompt for it to be entered with a popup
if (!api_key) {
    setupPopup(region);
    $("#welcomeModal").modal(); 
    
    // Get the updated API key and region and display them
    $("#welcomeModal").on("hide.bs.modal", function() {
        api_key = getApiKey();
        region = $("main")[0].getAttribute("region");
    });
    
} 

$(".results-row").hide();
$(".search-button").attr("disabled", true);

$("#indications_nav").addClass("active");
navUnderlineSetup();
restyleDatatableFilter();

// Add underline highlight when the search bar is in focus.
// Piggybacks off of the Selectize.js CSS.
$("#indication-name").on("focus", function(e) {
    $(".selectize-input").addClass("focus");
});

// Remove the underline highlight when the search bar is out of focus.
// Piggybacks off of the Selectize.js CSS.
$("#indication-name").on("blur", function(e) {
    $(".selectize-input").removeClass("focus");
});

// Grab all the kind options from the template and put into an array.
// These values are used for constructing the query sent to the API.
$(".kind-option").each(function() {
    options[$(this).children("input").attr("value")] = $(this).children("label").text();
})

// Enable the search button once text is in the search box.
// Disable otherwise.
$("#indication-name").on("input", function(e) {

    if ($("#indication-name").val()) {
        $(".search-button").attr("disabled", false);
        $(".search-button").removeClass("search-button-disabled");
    } else {
        $(".search-button").attr("disabled", true);
        $(".search-button").addClass("search-button-disabled");
    }
}); 
    
// If the enter key is pressed when there is text in the 
// search box, act as if the search button has been pressed.
// Nothing happens if the search box is empty.
$(document).keypress(function(event) {
    if (event.which == '13') {
        event.preventDefault();
        if ($("#indication-name").val() && $("#indication-name").prop("disabled") == false) {
            $("button.search-button").trigger("click");
        }
    }
});

// Search indications when form is submitted.
$("button.search-button").on("click", function(e) {

    // If the results section is shown, the button is used for resetting the search
    if ($(this).hasClass("search-button-reset")) {
        searchReset();
        return;
    }
    
    $("#loader").show();
    $("#indication-name").prop("disabled", true);
    
    var q = $("#indication-name").val();
    var more = $("input[name='specificity']:checked").val();
    var off_label = $("input[name='off_label']:checked").val();
    var otc_use = $("input[name='otc_use']:checked").val();;
    var indications_params = "?q=" + q;
    var kind = [];

    // Get all the checked therapy kinds and put them into array
    $(".kind-option").each(function() { 
        if ($(this).children("input").is(":checked")) {
            kind.push($(this).children("input").attr("value"));
        }
    })
    
    if (more) {
        indications_params += "&more=" + more;
    }
    if (kind) {
        indications_params += "&kind=" + kind.join(",");
    }
    if (off_label) {
        indications_params += "&off_label=" + off_label;
    }
    if (otc_use) {
        indications_params += "&otc_use=" + otc_use;
    }

    return $.ajax({
        url: localhost + encodeURI("indications" + indications_params),
        // Brief delay to a) work around a select2 bug that is not patched in the version
        // included in rails-select2 (https://github.com/select2/select2/issues/4205)
        // and b) reduce the number of requests sent
        delay: 100,
        data: {
            request_path: encodeURI(indications_params)
        },
        success: function(data) {

            // Fill the side display
            displayRequest(encodeURI(api_route + indications_params), data, api_key);
            showSearchTerms();
            // Load results in table and show the table
            loadResults(data);
            return $("#loader").hide();

        },
        error: function(jqXHR, textStatus, errorThrown) {
            $("#loader").hide();
            return handleError(jqXHR, "#indication-name");
        }
    });

});

