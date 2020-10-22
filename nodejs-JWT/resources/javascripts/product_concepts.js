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

//var localStorage.getItem("token");
var region;
var drugSelect; // used for clearing the drug search bar
var db_id; // the id to use in the final search
var products_table = $('.products-table').DataTable({ 
    order: [[0, "desc"]],
    "columnDefs": [
        { className: "table_col_name", "targets": [0] } // bolds the first column text
    ],
    "language": {
        info: "_TOTAL_ results found"
    },
    dom: '<"row datatable-if" <"col-sm-12 col-md-6"i> <"col-sm-12 col-md-6"f> > rt',
    scrollResize: true,
    scrollX: true,
    scrollY: 100,
    scrollCollapse: true,
    paging: true,
    lengthChange: false,
    pageLength: 1000,
});

/**
 * Product Concepts Page Functions
 * 
 * Includes functions for loading 
 * results and resetting the search.
 */

/**
 * Function that is called when input is detected in the search bar.
 * Sends an AJAX request to populate the dropdown.
 * If the token used to access the API is invalid, it is updated and then
 * the function is called again. The function is async so that the
 * new token can be obtained before trying API access again.
 * @param {*} query 
 * @param {*} callback 
 */
selectizeLoad = async function(query, callback) {
    
    if (!query.length || query.length < 3) {
        return callback();
    }

    let api_url = host + region + encodeURI("product_concepts");
    
    $.ajax({
        url: api_url, 
        headers: getHeaders(),
        type: "GET",
        data: {
            q: query
        },
        success: function (data) {
            var url = api_url + encodeURI("?q=" + query);
            displayRequest(api_url, data, "Bearer " + localStorage.getItem("token"));
            callback(data);
        },
        error: async function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.responseJSON.error == "Token invalid") {
                await getJWT();
                return selectizeLoad(query, callback);
            } else {
                handleError(jqXHR, true);
                callback();
            }
            
        }

    });
} 

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

    db_id = val;
    let api_url = host + region + encodeURI("product_concepts/" + val + "/routes");

    var searchChangeAjax = function() {
        $.ajax({
            url: api_url,
            headers: getHeaders(),
            success: function (data) {
                displayRequest(api_url, data, "Bearer " + localStorage.getItem("token"));
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
            error: async function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON.error == "Token invalid") {
                    await getJWT();
                    searchChangeAjax();
                } else {
                    handleError(jqXHR, true);
                }
            }

        });

    }   
    
    searchChangeAjax();
    
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
    products_table.columns.adjust().draw();

    // Change the search button function to reset the search
    $(".search-button").addClass("search-button-reset");
    $(".search-button-text").html("Reset Search");
    
}

/**
 * Displays the selected search parameters below the
 * search bar after a request is sent.
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
    drugSelect[0].selectize.enable();

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

region = getRegion(); 

$("#errorOk").on("click", function() {
    $("#errorModal").modal("hide");
});

$(".results-row").hide();
$("#product_concepts_nav").addClass("active");

$(".search-button").attr("disabled", true);
$(".route_autocomplete").attr("disabled", true);
$(".strength_autocomplete").attr("disabled", true);
$(".form_autocomplete").attr("disabled", true);

navUnderlineSetup();
restyleDatatableFilter();

if (localStorage.getItem("first_time") == null) {
    setupPopup();
    $("#welcomeModal").modal();
}

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
    load: async function(query, callback) {
        selectizeLoad(query, callback)
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
        
    db_id = $(this).val();

    let api_url = host + region + encodeURI("product_concepts/" + $(this).val() + "/forms")

    // Wrap the ajax call in a function so it can be called again if JWT error
    var routeChange = function(){
        $.ajax({
            url: api_url,
            headers: getHeaders(),
            success: function (data) {
                displayRequest(api_url, data, "Bearer " + localStorage.getItem("token"));
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
            error: async function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON.error == "Token invalid") {
                    await getJWT();
                    routeChange();
                } else {
                    handleError(jqXHR, true);
                }
            }

        });
    } 

    routeChange(); // Call the ajax function

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
        
    db_id = $(this).val();

    let api_url = host + region + encodeURI("product_concepts/" + $(this).val() + "/strengths");

    // Wrap the ajax call in a function so it can be called again if JWT error
    var formChange = function() { 
        $.ajax({
            url: api_url,
            headers: getHeaders(),
            success: function (data) {
                displayRequest(api_url, data, "Bearer " + localStorage.getItem("token"));
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
            error: async function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON.error == "Token invalid") {
                    await getJWT();
                    formChange();
                } else {
                    handleError(jqXHR, true);
                }
            }

        });
    }    

    formChange(); // Call the ajax function

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

    drugSelect[0].selectize.disable();
    $("#loader").show();
    clearTableResults(products_table);

    let api_url = host + region + encodeURI("product_concepts/" + db_id + "/products")

    // Wrap the ajax call in a function so it can be called again if JWT error
    var getPCs = function() {
        $.ajax({
            url: api_url,
            headers: getHeaders(),
            success: function (data) {
                displayRequest(api_url, data, "Bearer " + localStorage.getItem("token"));
                showSearchTerms();
                loadResults(data);
                $("#loader").hide();
            },
            error: async function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON.error == "Token invalid") {
                    await getJWT();
                    getPCs();
                } else {
                    handleError(jqXHR, true);
                    $("#loader").hide();
                }
                
            }

        });
    }

    getPCs(); // Call the ajax function

}); 
