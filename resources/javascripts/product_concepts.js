/**
 * DrugBank API Sample App:
 * product_concepts.js
 * 
 * JavaScript that's run on the "Product Concepts" section.
 * Handles searching for a product concept and then filtering
 * down by route, form, and strength, and creating a valid query
 * that is then sent to the DrugBank API through the locally run server.
 * 
 * Most of the code here is just for functionality of the page.
 * Parts involved in calling the API include: 
 * 
 *  - Initializing the search bar: 
 *      drugSelect = $(".drug_autocomplete").selectize()
 * 
 *  - Selecting a product concept from the search bar then loads the routes: 
 *      searchChange()
 * 
 *  - Selecting a route from the dropdown then loads the forms:
 *      $(".route_autocomplete").on("change")
 * 
 *  - Selecting a form from the dropdown then loads the strengths:
 *      $(".form_autocomplete").on("change")
 * 
 *  - submitting the request on clicking the search button: 
 *      $("button.search-button").on("click")
 */

var api_key = getApiKey();
var drugSelect; // used for clearing the drug search bar
var db_id; // the id to use in the final search
var api_route = $("main")[0].attributes["api_route"].value;
var products_table = $('.products-table').DataTable({
    order: [[0, "desc"]],
    "columnDefs": [
        { className: "table_col_name", "targets": [0] } // bolds the first column text
    ],
});

/**
 * Product Concepts Page Functions
 * 
 * Includes functions for loading 
 * results and resetting the search.
 */

/** 
 * Loads the product concept routes when a drug is selected.
 * 
 * Needs its own standalone function (not in an event wrapper) 
 * due to how Selectize.js handles events.
 * 
 * val is the value in the drug autocomplete. If no value,
 * then everything is cleared and readied for a fresh search
 * (which happens when the reset search button is clicked).
 */
searchChange = function(val) {

    // If the drug_autocomplete changed to anything (including empty),
    // empty the other autocomplete forms and disable them.
    // route_autocomplete will be enabled if an actual val is detected
    $(".route_autocomplete").empty();
    $(".form_autocomplete").empty();
    $(".strength_autocomplete").empty();

    $(".route_autocomplete").attr("disabled", true);
    $(".form_autocomplete").attr("disabled", true);
    $(".strength_autocomplete").attr("disabled", true);

    // If drug_autocomplete's value was changed to be empty
    if (!val) {

        // Clear the drug autocomplete
        drugSelect[0].selectize.clear(); // removes value from drug autocomplete
        drugSelect[0].selectize.clearOptions(); // removes dropdown choices from drug autocomplete
        
        // Disable the search button
        $(".search-button").attr("disabled", true); 
        $(".search-button").addClass("search-button-disabled");

        return;
    }
    
    $(".search-button").attr("disabled", false);
    $(".search-button").removeClass("search-button-disabled");

    var path = encodeURI("/" + val + "/routes");
    db_id = val;

    $.ajax({
        url: localhost + encodeURI("product_concepts") + path,
        delay: 100,
        success: function (data) {
            displayRequest(api_route + path, data, api_key);
            data.map(function (d) {
                return {
                    route: d.route,
                    id: d.drugbank_pcid
                };
            }).sort(function (a, b) {
                return a.route.localeCompare(b.route);
            }).forEach(function (r) {
                $(".route_autocomplete").append(new Option(r.route, r.id, false, false));
            });
            $(".route_autocomplete").val(null).trigger('change');
            $(".route_autocomplete").attr("disabled", false);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handleError(jqXHR, ".drug_autocomplete");
        }

    });
};

/**
 * Grabs the strengths for a given hit from the API response.
 * Converts data from a map to a single line string for display in the table.
 * Used in loadTableResults().
 */
getStrengths = function (d) {
    return d.ingredients.map(function (i) {
        return i.name + " " + i.strength.number + " " + i.strength.unit;
    }).join("<br>");
};

/**
 * Loads the results from the API response into the page's table.
 * Puts into the table each product concept's name, dosage
 * form, strength, route, and labeller.
 */
loadTableResults = function (products_table, data) {
    data.forEach(function (d) {
        products_table.row.add([d.name, d.dosage_form, getStrengths(d), d.route, d.labeller.name]);
    });
    products_table.draw();
};

/**
 * Loads the results of the search into the table, then hides
 * the search area and displays the table. Also changes the 
 * search button function to reset the search (searchReset()).
 * 
 * @param {*} data the data obtained from the search ajax call
 */
loadResults = function (data) {

    loadTableResults(products_table, data);

    $(".select-row").hide();
    $(".results-row").show();

    // Change the search button function to reset the search
    $(".search-button").addClass("search-button-reset");
    $(".search-button-text").html("Reset Search");
    
}

/**
 * Displays the selected search parameters below the
 * search bar after a search is sent.
 * Goes through the term-group children in order by indexing from 0-2 (using eq()).
 */
showSearchTerms = function() {

    if ($(".route_autocomplete").val()) {
        $(".term-group").css('margin-top', '10px'); // adds margin above terms for spacing
        $(".term-group").children().eq(0).css('display', 'inline-block');
        $(".term-group").children().eq(0).children().html($(".route_autocomplete").select2("data")[0].text);

    } else {
        return; // If no route term was selected, then no other terms will be either
    }

    if ($(".form_autocomplete").val()) {
        $(".term-group").children().eq(1).css('display', 'inline-block');
        $(".term-group").children().eq(1).children().html($(".form_autocomplete").select2("data")[0].text);
    }

    if ($(".strength_autocomplete").val()) {
        $(".term-group").children().eq(2).css('display', 'inline-block');
        $(".term-group").children().eq(2).children().html($(".strength_autocomplete").select2("data")[0].text);
    }

}

/**
 * Resets the page after a search is performed by
 * clearing the results table, hiding it, clearing and hiding
 * the search terms below the search bar, clearing the search dropdowns,
 * and displaying the form selects again.
 */
searchReset = function() {

    $("#loader").show();

    searchChange(null);
    clearDisplayRequest();
    clearSearchTermsDisplay();
    
    $(".results-row").hide();
    $(".select-row").show();

    $(".search-button").removeClass("search-button-reset");
    $(".search-button-text").html("Search");

    clearTableResults(products_table);

    $("#loader").hide();

}

/* End of functions */

/**
 * Initialization code for the page. 
 * Initializes parts like the search bar, selects, 
 * and nav underline, and sets event listeners.
 * 
 * This could all go in $(document).ready(), but doing so 
 * causes the search bar and nav underline to flicker on page load,
 * and event listeners don't need to go in it.
 */

$(".results-row").hide();
$("#product_concepts_nav").addClass("active");

$(".search-button").attr("disabled", true);
$(".route_autocomplete").attr("disabled", true);
$(".strength_autocomplete").attr("disabled", true);
$(".form_autocomplete").attr("disabled", true);

navUnderlineSetup();
restyleDatatableFilter();

// Initialize the Selectize.js select
drugSelect = $(".drug_autocomplete").selectize({
    valueField: "drugbank_pcid",
    labelField: "name",
    searchField: "name",
    create: false,
    persist: false,
    placeholder: "Search by brand or active ingredient",
    onChange:  function(value) {
        searchChange(value);
    },
    load: function(query, callback) {
        if (!query.length || query.length < 3) return callback();
        $.ajax({
            url: localhost + encodeURI("product_concepts"),
            type: "GET",
            data: {
                q: query
            },
            success: function (data) {
                var url = api_route + encodeURI("?q=" + query);
                displayRequest(url, data, api_key);
                callback(data)
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handleError(jqXHR, ".drug_autocomplete");
            }

        });
    }
});

// Add the search icon to the search bar, which is now initialized
addSearchIconToSelect(); 

// Activate the route input
$(".route_autocomplete").select2({
    theme: "drugbank",
    placeholder: "Select Route",
});

/**
 * Load the product concept forms when a route is selected.
 * Form and strength autocompletes remain 
 * disabled until API call is successful.
 */
$(".route_autocomplete").on("change", function (e) {
    
    $(".form_autocomplete").empty();
    $(".strength_autocomplete").empty();

    $(".form_autocomplete").attr("disabled", true);
    $(".strength_autocomplete").attr("disabled", true);

    // If no value, return after disabling the form and strength autocompletes.
    if (!$(this).val()) {
        return;
    }
        
    var path = encodeURI("/" + $(this).val() + "/forms");
    db_id = $(this).val();

    $.ajax({
        url: localhost + encodeURI("product_concepts") + path,
        delay: 100,
        success: function (data) {
            displayRequest(api_route + path, data, api_key);
            data.map(function (d) {
                return {
                    form: d.name,
                    id: d.drugbank_pcid
                };
            }).sort().forEach(function (r) {
                $(".form_autocomplete").append(new Option(r.form, r.id, false, false));
            });
            $(".form_autocomplete").val(null).trigger('change');
            $(".form_autocomplete").attr("disabled", false);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handleError(jqXHR, ".route_autocomplete");
        }

    });

});

// Activate the dosage input
$(".form_autocomplete").select2({
    theme: "drugbank",
    placeholder: "Select Form"
});

/** 
 * Load the product concept strengths when a route is selected.
 * The strength autocompletes remain disabled until API call is successful.
 */ 
$(".form_autocomplete").on("change", function (e) {
    
    $(".strength_autocomplete").empty();
    $(".strength_autocomplete").attr("disabled", true);

    // If no value, return after disabling the strength autocomplete.
    if (!$(this).val()) {
        return;
    }
        
    var path = encodeURI("/" + $(this).val() + "/strengths");
    db_id = $(this).val();

    $.ajax({
        url: localhost + encodeURI("product_concepts") + path,
        delay: 100,
        success: function (data) {
            displayRequest(api_route + path, data, api_key);
            data.map(function (d) {
                return {
                    strength: d.name,
                    id: d.drugbank_pcid
                };
            }).sort().forEach(function (r) {
                $(".strength_autocomplete").append(new Option(r.strength, r.id, false, false));
            });
            $(".strength_autocomplete").val(null).trigger('change');
            $(".strength_autocomplete").attr("disabled", false);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handleError(jqXHR, ".form_autocomplete");
        }

    });

});

// Activate the strength input
$(".strength_autocomplete").select2({
    theme: "drugbank",
    placeholder: "Select Strength"
});

// Load the product concepts when a strength is selected
$(".strength_autocomplete").on("change", function (e) {
    
    if (!$(this).val()) {
        return;
    } else {
        db_id = $(this).val();
    }

});

/**
 * Calls the API one last time, using the variable db_id, which has the id
 * from following drug -> route -> form -> strength and changes at every step.
 */
$("button.search-button").on("click", function(e) {

    if (!db_id) {
        return;
    } 

    if ($(this).hasClass("search-button-reset")) {
        searchReset();
        return;
    }

    $("#loader").show();
    clearTableResults(products_table);

    var path = encodeURI("/" + db_id + "/products");

    $.ajax({
        url: localhost + encodeURI("product_concepts") + path,
        delay: 100,
        success: function (data) {
            displayRequest(api_route + path, data, api_key);
            showSearchTerms();
            loadResults(data);
            $("#loader").hide();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handleError(jqXHR, ".strength_autocomplete");
            $("#loader").hide();
        }

    });

}); 
