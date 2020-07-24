var api_key = getApiKey();
var drugSelect; // used for interacting with the drug search bar
var api_route = $("main")[0].attributes["api_route"].value;
var interactions_table = $('.interactions-table').DataTable({
    order: [[0, "desc"]],
    "columnDefs": [
        { className: "table_col_name", "targets": [0] } // bolds the first column text
    ],
});

// When drug autocomplete is changed, add the selected drug 
// to the list and check the list length
searchChange = function (value) {

    // If something is selected
    if (value) {

        // Add the product to our list
        var text = $(".selectize-input .item").text();
        $("#drug-product-list").append(`<div class='drug-product btn btn-md btn-label' data-code='${value}'>${text}<span class='close'></span></div>`);
        addDrugRemoveListener();
        checkListLength();

        // Clear the drug autocomplete
        drugSelect[0].selectize.clear(); // removes value from drug autocomplete
        drugSelect[0].selectize.clearOptions(); // removes dropdown choices from drug autocomplete

    }

};

/**
 * Adds an event listener for removal of the new drug added to the list.
 * When a drug is removed from the list, the list length is also checked.
 */
addDrugRemoveListener = function () {

    // Add handler to remove product on click and update results
    $("#drug-product-list .close").on('click', function (e) {
        $(this).parent().remove();
        checkListLength();
    });

}

/**
 * Checks how many drugs are in the current list, and take action
 * based on how many there are:
 * 
 *  0-1:  disables the search button (need more in list)
 *  2:    minimum length for interaction chcek, so search button is enabled
 *  40:   the max amount of items that can be in the list. Disables the drug search
 *        so more drugs can't be added to the list.
 *  39:   One less than the max amount, so the drug search is enabled.
 *  3-38: Nothing.
 */
checkListLength = function() {

    var drugList = $("#drug-product-list .drug-product");

    switch (drugList.length) {
        case 0:
        case 1:
            $(".search-button").attr("disabled", true); 
            $(".search-button").addClass("search-button-disabled");
            return;
        case 2:
            $(".search-button").attr("disabled", false); 
            $(".search-button").removeClass("search-button-disabled");
            return
        case 40:
            drugSelect[0].selectize.disable();
            return;   
        case 39:
            drugSelect[0].selectize.enable();
            return
        default:
            return; 
    }

}

/**
 * Loads the results of the search into the table, then hides
 * the search area and displays the table. Also changes the 
 * search button function to reset the search (searchReset()).
 * 
 * @param {*} data the data obtained from the search ajax call
 */
loadResults = function (data) {

    loadTableResults(interactions_table, data);

    $(".drugs-row").hide();
    $(".results-row").show();

    $(".search-button").addClass("search-button-reset");
    $(".search-button-text").html("Reset Search");
    
}

/**
 * Loads the results from the API response into the page's table.
 * Puts into the table each interaction drug's name, severity,
 * and description.
 */
loadTableResults = function (interactions_table, data) {
    data.interactions.forEach(function (d) {
        return interactions_table.row.add([d.product_concept_name, d.affected_product_concept_name, d.severity, d.description]);
    });

    interactions_table.draw(); 
};

/**
 * Resets the page after a search is performed by
 * clearing the results table, hiding it, clearing and hiding
 * the search terms below the search bar, clearing the search dropdowns,
 * and displaying the form selects again.
 */
searchReset = function() {

    $("#loader").show();

    // // If you want to clear all drugs from the 
    // // list on search reset, uncomment this whole block!
    // $("#drug-product-list .close").each(function (e) {
    //     $(this).trigger("click");
    // });

    clearDisplayRequest();
    clearSearchTermsDisplay();
    
    $(".results-row").hide();
    $(".drugs-row").show();

    $(".search-button").removeClass("search-button-reset");
    $(".search-button-text").html("Search");

    clearTableResults(interactions_table);

    $("#loader").hide();

}

$(document).ready(function () {

    $(".results-row").hide();

    $("#ddi_nav").addClass("active");
    navUnderlineSetup();
    restyleDatatableFilter();
    addDrugRemoveListener();

    drugSelect = $(".drug_autocomplete").selectize({
        valueField: "drugbank_pcid",
        labelField: "name",
        searchField: "name",
        create: false,
        persist: false,
        placeholder: "Start typing a drug name",
        onChange:  function(value) {
            searchChange(value);
        },
        load: function(query, callback) {
            if (!query.length || query.length < 3) return callback();
            $.ajax({
                url: localhost + encodeURI("product_concepts"),
                delay: 100,
                type: "GET",
                data: {
                    q: query
                },
                processResults: function (data) {
                    return {
                        results: $.map(data, function (i) {
                            return {
                                id: i.drugbank_pcid,
                                text: i.name
                            };
                        })
                    };
                },
                success: function(data) {
                    callback(data)
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(jqXHR, ".drug_autocomplete");
                }
            })
        } 
    });
    
    // Add the search icon to the search bar
    $(".selectize-control").append(
        "<svg class=\"search-icon\">\
          <use xlink:href=\"images/svg-defs.svg#search-icon\" /> \
        </svg>"
    );

    // Get all the drugs from the list, add them to the 
    // API query, submit it, and load results table.
    $("button.search-button").on("click", function(e) {

        if ($(this).hasClass("search-button-reset")) {
            searchReset();
            return;
        }

        var codes, ddi_params;

        // If there are at least 2 products selected, search for interactions
        if ($("#drug-product-list .drug-product").length > 1) {
            $("#loader").show();
            
            // Empty the interactions table
            clearTableResults(interactions_table);

            // Get the list of NDC codes
            codes = $("#drug-product-list .drug-product").map(function () {
                return $(this).data("code");
            }).toArray().join();

            ddi_params = "?product_concept_id=" + codes;

            $.ajax({
                url: localhost + encodeURI("ddi" + ddi_params),
                // Brief delay to a) work around a select2 bug that is not patched in the version
                // included in rails-select2 (https://github.com/select2/select2/issues/4205)
                // and b) reduce the number of requests sent
                delay: 100,
                success: function (data) {
    
                    // Fill the side display
                    displayRequest(encodeURI(api_route + ddi_params), data, api_key);
    
                    // Fill the table
                    loadResults(data);

                    return $("#loader").hide();
    
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(jqXHR, ".drug_autocomplete");
                    return $("#loader").hide();
                }
            });
        }

    });

    checkListLength(); // set up for the example drugs in list

});
