/**
 * DrugBank API Sample App
 * product_concepts.js
 * 
 * Functions for the product concepts search page.
 * There is no $(document).ready() for this file as it causes the selects
 * to flicker when the page loads and they convert to select2s.
 */

api_key = getApiKey();
var drugSelect // used for clearing the drug search bar
var db_id; // the idea to use in the final search
var api_route = $("main")[0].attributes["api_route"].value;
var products_table = $('.products-table').DataTable({
    order: [[0, "desc"]],
    "columnDefs": [
        { className: "product_concepts_name", "targets": [0] }
    ],
});

/** 
 * Loads the product concept routes when a drug is selected.
 * 
 * Needs its own standalone function (not in an event wrapper) 
 * due to how Selectize.js handles events.
 * 
 * val is the value in the drug autocomplete. If no value,
 * then everything is cleared and readied for a fresh search
 */
function searchChange(val) {

    // If the drug_autocomplete changed to anything (including emptied),
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

        //clear drug autocomplete
        drugSelect[0].selectize.clear(); // removes value from drug autocomplete
        drugSelect[0].selectize.clearOptions(); // removes dropdown choices from drug autocomplete
        
        // disable search button
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
            displayRequest(api_route + path, data);
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

getStrengths = function (d) {
    return d.ingredients.map(function (i) {
        return i.name + " " + i.strength.number + " " + i.strength.unit;
    }).join("<br>");
};

/**
 * Loads the results from the API response into the page's table.
 * Puts into the table the each product concept's name, dosage
 * form, strength, route, and labeller
 */
loadTableResults = function (products_table, data) {
    data.forEach(function (d) {
        products_table.row.add([d.name, d.dosage_form, getStrengths(d), d.route, d.labeller.name]);
    });
    products_table.draw();
};

/**
 * Replaces the table search bar with a DrugBank themed one
 */
restyleDatatableFilter = function() {
    
    // Replace and the searchbar for the results table
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

    $(".search-button").addClass("search-button-reset");
    $(".search-button-text").html("Reset Search");
    
}

// Displays the selected search parameters below the
// search bar after a search is sent
showSearchTerms = function() {

    if ($(".route_autocomplete").val()) {
        
        $(".term-group").css('margin-top', '10px');
        
        $("#route-term-container").css('display', 'inline-block');
        $(".route-term").html($(".route_autocomplete").select2("data")[0].text);

    } else {
        return;
    }

    if ($(".form_autocomplete").val()) {
        
        $("#form-term-container").css('display', 'inline-block');
        $(".form-term").html(
            $(".form_autocomplete").select2("data")[0].text
        );
    }

    if ($(".strength_autocomplete").val()) {
        
        $("#strength-term-container").css('display', 'inline-block');
        $(".strength-term").html(
            $(".strength_autocomplete").select2("data")[0].text
        );
    }

}

/**
 * Resets the page after a search is performed by
 * clearing the results table, hiding it, clearing and hiding
 * the search terms below the search bar, clearing the search dropdowns,
 * and disaplying the form selects again.
 */
searchReset = function() {

    $("#loader").show();

    //$(".drug_autocomplete").val(null).trigger("change");
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

// Clears and hides the terms below the search bar.
// For use after the "reset search" button is clicked.
clearSearchTermsDisplay = function() {

    // Remove top margin for the group so the search bar is
    // vertically centered in its container
    $(".term-group").css("margin-top", "0");

    // Clear the values
    $(".route-term").html(null);
    $(".form-term").html(null);
    $(".strength-term").html(null);

    // Hide the containers
    $("#route-term-container").hide();
    $("#form-term-container").hide();
    $("#strength-term-container").hide();
}

$(document).ready(function() {

    $(".results-row").hide();
    $(".search-button").attr("disabled", true);
    $(".route_autocomplete").attr("disabled", true);
    $(".strength_autocomplete").attr("disabled", true);
    $(".form_autocomplete").attr("disabled", true);

    $("#product_concepts_nav").addClass("active");
    navUnderlineSetup();

    restyleDatatableFilter();
    
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
        //createFilter: function(input) { return input.length >= 3; },
        load: function(query, callback) {
            if (!query.length) return callback();
            $.ajax({
                url: localhost + encodeURI("product_concepts"),
                type: "GET",
                data: {
                    q: query
                },
                success: function (data) {
                    var url = api_route + encodeURI("?q=" + query);
                    displayRequest(url, data);
                    callback(data)
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(jqXHR, ".drug_autocomplete");
                }
    
            });
        }
    });
    
    // Add the search icon to the search bar
    $(".selectize-control").append(
        "<svg class=\"search-icon\">\
          <use xlink:href=\"images/svg-defs.svg#search-icon\" /> \
        </svg>"
    ); 

    // Activate the route input
    $(".route_autocomplete").select2({
        theme: "drugbank",
        placeholder: "Select Route",
    });

    // Load the product concept strengths when a route is selected
    $(".route_autocomplete").on("change", function (e) {
        
        $(".form_autocomplete").empty();
        $(".strength_autocomplete").empty();

        $(".form_autocomplete").attr("disabled", true);
        $(".strength_autocomplete").attr("disabled", true);

        if (!$(this).val()) {
            return;
        }
            
        var path = encodeURI("/" + $(this).val() + "/forms");
        db_id = $(this).val();

        $.ajax({
            url: localhost + encodeURI("product_concepts") + path,
            delay: 100,
            success: function (data) {
                displayRequest(api_route + path, data);
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

    // Load the product concept strengths when a route is selected
    $(".form_autocomplete").on("change", function (e) {
        
        $(".strength_autocomplete").empty();
        $(".strength_autocomplete").attr("disabled", true);

        if (!$(this).val()) {
            return;
        }
            
        var path = encodeURI("/" + $(this).val() + "/strengths");
        db_id = $(this).val();

        $.ajax({
            url: localhost + encodeURI("product_concepts") + path,
            delay: 100,
            success: function (data) {
                displayRequest(api_route + path, data);
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
                displayRequest(api_route + path, data);
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

});  
