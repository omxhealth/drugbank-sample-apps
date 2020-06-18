activeDrugList = function(interactions_table, search, api_host) {

    // Add handler to remove product on click and update results
    $("#drug-product-list .glyphicon-remove").on('click', function(e) {
        
        $(this).parent().remove();
        
        if ($("#drug-product-list .drug-product").length < 3) {
            $(search).prop("disabled", false);
        }

        loadTableResults(interactions_table, search, api_host);

    });

};

loadTableResults = function(interactions_table, search) {
    var codes, ddi_url;
    
    // Empty the interactions table
    clearTableResults(interactions_table);

    // If there are at least 2 products selected, search for interactions
    if ($("#drug-product-list .drug-product").length > 1) {
        $("#loader").show();

        // Get the list of NDC codes
        codes = $("#drug-product-list .drug-product").map(function() {
            return $(this).data("code");
        }).toArray().join();

        ddi_url = "ddi?product_concept_id=" + codes;

        return $.ajax({
            url: localhost + encodeURI(ddi_url),
            // Brief delay to a) work around a select2 bug that is not patched in the version
            // included in rails-select2 (https://github.com/select2/select2/issues/4205)
            // and b) reduce the number of requests sent
            delay: 100,
            success: function(data) {
                var search_url;

                // Fill the side display
                search_url = encodeURI(api_host + ddi_url);
                displayRequest(search_url, data);
                
                // Fill the table
                data.interactions.forEach(function(d) {
                    return interactions_table.row.add([d.product_concept_name, d.affected_product_concept_name, d.severity, d.description]);
                });

                interactions_table.draw();
                return $("#loader").hide();

            },
            error: function(jqXHR, textStatus, errorThrown) {
                handleError(jqXHR, ".drug_autocomplete");
                return $("#loader").hide();
            }
        });
    }
};

$(document).ready(function() {
    
    var interactions_table = $('.interactions-table').DataTable({
        order: [[0, "desc"]]
    });

    // Activate the drug search input
    $(".drug_autocomplete").select2({
        theme: "bootstrap",
        placeholder: "Start typing a drug name",
        minimumInputLength: 3,
        templateResult: function(d) {
            return $('<span>' + em_to_u_tags(d.text) + '</span>');
        },
        templateSelection: function(d) {
            return $('<span>' + strip_em_tags(d.text) + '</span>');
        },
        ajax: {
            url: localhost + encodeURI("product_concepts"),
            delay: 100,
            data: function(params) {
                return {
                    q: encodeURI(params.term)
                };
            },
            processResults: function(data) {
                return {
                    results: $.map(data, function(i) {
                        return {
                            id: i.drugbank_pcid,
                            text: highlight_name(i)
                        };
                    })
                };
            },
            error: function(jqXHR, textStatus, errorThrown) {
                handleError(jqXHR, ".drug_autocomplete");
            }
        }
    });

    // Load our initial example
    activeDrugList(interactions_table, ".drug_autocomplete");
    loadTableResults(interactions_table, ".drug_autocomplete");

    // When drug autocomplete is changed, load the related routes
    $("#interactions-tutorial .drug_autocomplete").on("change", function(e) {
        var text;

        // If something is selected
        if ($(this).val()) {

            // Add the product to our list
            text = $(this).find(`option[value=${$(this).val()}]`).text();
            $("#drug-product-list").append(`<div class='drug-product btn btn-md btn-label' data-code='${$(this).val()}'>${text}<span class='glyphicon glyphicon-remove'></span></div>`);
            activeDrugList(interactions_table, this, api_host);

            // Update the results table
            loadTableResults(interactions_table, this, api_host);

            // Clear the drug product search
            $(".drug_autocomplete").val(null).trigger('change');

            if ($("#drug-product-list .drug-product").length > 2) {
                return $(this).prop("disabled", true);
            }

        }

    });

});