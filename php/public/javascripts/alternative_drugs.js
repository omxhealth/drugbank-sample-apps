$(document).ready(function() {
    
    var alternatives_table = $('.alternative-table').DataTable({
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
            success: function(data) {
                var url = encodeURI(api_host + "product_concepts?q=" + $(".select2-search__field").val());
                displayRequest(url, data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                handleError(jqXHR, ".drug_autocomplete");
            }
        }
    });

    // Load the product concept routes when a drug is selected
    $("#product-concepts-tutorial .drug_autocomplete").on("change", function(e) {
        $(".route_autocomplete").empty();
        $(".strength_autocomplete").empty();
        clearTableResults(alternatives_table);
        if ($(this).val()) {
            var path = encodeURI("product_concepts/" + $(this).val() + "/similar_indications")
            $.ajax({
                url: localhost + path,
                delay: 100,
                success: function(data) {
                    displayRequest(api_host + path, data);
                    data.map(function(d) {
                        return {
                            route: d.route,
                            id: d.drugbank_pcid
                        };
                    }).sort(function(a, b) {
                        return a.route.localeCompare(b.route);
                    }).forEach(function(r) {
                        $(".route_autocomplete").append(new Option(r.route, r.id, false, false));
                    });
                    $(".route_autocomplete").val(null).trigger('change');
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    handleError(jqXHR, ".drug_autocomplete");
                }
            });
        }
    });

});    