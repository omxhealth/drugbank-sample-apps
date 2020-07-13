/**
 * Drugbank API Sample App
 * product_concepts.js
 * 
 * Functions for the product concepts search page.
 * There is no $(document).ready() for this file as it causes the selects
 * to flicker when the page loads and they convert to select2s.
 */

var api_route = $(".main-container")[0].attributes["api_route"].value;
var products_table = $('.products-table').DataTable({
    order: [[0, "desc"]]
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
    if ($(".drug_autocomplete").val() && $(".route_autocomplete").val() && $(".strength_autocomplete").val()) {
        data.forEach(function (d) {
            products_table.row.add([d.name, d.dosage_form, getStrengths(d), d.route, d.labeller.name]);
        });
        products_table.draw();
    }
    
};

// Activate the drug search input
$(".drug_autocomplete").select2({
    theme: "bootstrap",
    placeholder: "Start typing a drug name",
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

// Load the product concept routes when a drug is selected
$("#product-concepts-tutorial .drug_autocomplete").on("change", function (e) {
    $(".route_autocomplete").empty();
    $(".strength_autocomplete").empty();
    clearTableResults(products_table);

    if (!$(this).val()) {
        return;
    }

    var path = encodeURI("/" + $(this).val() + "/routes");

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
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handleError(jqXHR, ".drug_autocomplete");
        }

    });

});

// Activate the route input
$(".route_autocomplete").select2({
    theme: "bootstrap",
    placeholder: "Select a route"
});

// Load the product concept strengths when a route is selected
$("#product-concepts-tutorial .route_autocomplete").on("change", function (e) {
    $(".strength_autocomplete").empty();
    clearTableResults(products_table);
    
    if (!$(this).val()) {
        return;
    }
        
    var path = encodeURI("/" + $(this).val() + "/strengths");

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
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handleError(jqXHR, ".route_autocomplete");
        }

    });

});

// Activate the strength input
$(".strength_autocomplete").select2({
    theme: "bootstrap",
    placeholder: "Select a strength"
});

// Load the product concepts when a strength is selected
$("#product-concepts-tutorial .strength_autocomplete").on("change", function (e) {
    clearTableResults(products_table);
    
    if (!$(this).val()) {
        return;
    }

    var path = encodeURI("/" + $(this).val() + "/products");
    $("#loader").show();

    $.ajax({
        url: localhost + encodeURI("product_concepts") + path,
        delay: 100,
        success: function (data) {
            displayRequest(api_route + path, data);
            loadTableResults(products_table, data);
            $("#loader").hide();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            handleError(jqXHR, ".strength_autocomplete");
            $("#loader").hide();
        }

    });

});
