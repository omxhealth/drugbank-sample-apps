/**
 * Drugbank API Sample App
 * product_concepts.js
 * 
 * Functions for the product concepts search page.
 * There is no $(document).ready() for this file as it causes the selects
 * to flicker when the page loads and they convert to select2s.
 */

var api_route = $("main")[0].attributes["api_route"].value;
var db_id;
var products_table = $('.products-table').DataTable({
    order: [[0, "desc"]],
    "columnDefs": [
        { className: "product_concepts_name", "targets": [0] }
    ]
});

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
    if ($(".drug_autocomplete").val() && $(".route_autocomplete").val() && 
            $(".form_autocomplete").val() && $(".strength_autocomplete").val()) {
        data.forEach(function (d) {
            products_table.row.add([d.name, d.dosage_form, getStrengths(d), d.route, d.labeller.name]);
        });
        products_table.draw();
    }
    
};

$(document).ready(function() {

    $("#product_concepts_nav").addClass("active");
    navUnderlineSetup();

    $(".search-button").attr("disabled", true);
    $(".route_autocomplete").attr("disabled", true);
    $(".strength_autocomplete").attr("disabled", true);
    $(".form_autocomplete").attr("disabled", true);

    // Replace and restyle the searchbar for the results table
    var tableSearchInput = 
        "<div class=\"input-group\"> \
            <input placeholder=\"Search within results\" type=\"search\" id=\"example-search-input1\" class=\"form-control rounded-pill py-2 pr-5 mr-1\"> \
            <span class=\"input-group-append\"> \
                <div class=\"input-group-text border-0 bg-transparent ml-n5\"> \
                    <svg class=\"search-icon\">\
                        <use xlink:href=\"images/svg-defs.svg#search-icon\" /> \
                    </svg> \
                </div> \
            </span> \
        </div>";

    $(".dataTables_filter label").html(tableSearchInput);

    // Activate the drug search input
    $(".drug_autocomplete").select2({
        theme: "material",
        placeholder: "Search by brand or active ingredient",
        minimumInputLength: 3,
        templateResult: function (d) {
            return $('<span>' + em_to_u_tags(d.text) + '</span>');
        },
        templateSelection: function (d) {
            return $('<span>' + strip_em_tags(d.text) + '</span>');
        },
        ajax: {
            url: localhost + encodeURI("product_concepts"),
            delay: 100,
            data: function (params) {
                return {
                    q: encodeURI(params.term)
                };
            },
            processResults: function (data) {
                return {
                    results: $.map(data, function (i) {
                        return {
                            id: i.drugbank_pcid,
                            text: highlight_name(i)
                        };
                    })
                };
            },
            success: function (data) {
                var url = api_route + encodeURI("?q=" + $(".select2-search__field").val());
                displayRequest(url, data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handleError(jqXHR, ".drug_autocomplete");
            }

        }

    });

    // Add the search icon to the search bar
    $(".select2-selection__arrow").html("\
        <svg class=\"search-icon\"> \
            <use xlink:href=\"images/svg-defs.svg#search-icon\"/> \
        </svg>"
    );

    // Load the product concept routes when a drug is selected
    $(".drug_autocomplete").on("change", function (e) {

        $(".route_autocomplete").empty();
        $(".form_autocomplete").empty();
        $(".strength_autocomplete").empty();

        $(".route_autocomplete").attr("disabled", true);
        $(".form_autocomplete").attr("disabled", true);
        $(".strength_autocomplete").attr("disabled", true);

        if (!$(this).val()) {
            $(".search-button").attr("disabled", true);
            return;
        }
        
        $(".search-button").attr("disabled", false);

        var path = encodeURI("/" + $(this).val() + "/routes");
        db_id = $(this).val();

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

    });

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

        showSearchTerms();

        $("#loader").show();
        clearTableResults(products_table);

        var path = encodeURI("/" + db_id + "/products");

        $.ajax({
            url: localhost + encodeURI("product_concepts") + path,
            delay: 100,
            success: function (data) {
                displayRequest(api_route + path, data);
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

function loadResults(data) {

    loadTableResults(products_table, data);

    $(".select-row").hide();
    $(".results-row").show();

    $(".search-button").addClass("search-button-reset");
    $(".search-button-text").html("Reset Search");
    
}

function searchReset() {

    $("#loader").show();

    $(".drug_autocomplete").val(null).trigger("change");
    clearDisplayRequest();
    clearSearchTerms();
    
    $(".results-row").hide();
    $(".select-row").show();

    $(".search-button").removeClass("search-button-reset");
    $(".search-button-text").html("Search");

    clearTableResults(products_table);

    $("#loader").hide();

}

function showSearchTerms() {

    if ($(".route_autocomplete").val()) {
        $(".route-term").show().html(
            $(".route_autocomplete").select2("data")[0].text
        );
    }

    if ($(".form_autocomplete").val()) {
        $(".form-term").show().html(
            $(".form_autocomplete").select2("data")[0].text
        );
    }

    if ($(".strength_autocomplete").val()) {
        $(".strength-term").show().html(
            $(".strength_autocomplete").select2("data")[0].text
        );
    }

    $(".term-group").css('display', 'flex');

}

function clearSearchTerms() {
    $(".term-group").hide();
    $(".route-term").hide().html(null);
    $(".form-term").hide().html(null);
    $(".strength-term").hide().html(null);
}