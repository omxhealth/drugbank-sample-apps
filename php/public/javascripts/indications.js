var api_route = $(".main-container")[0].attributes["api_route"].value;

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

loadTableResults = function(indications_table, data, options) {
    
    // Empty the interactions table
    clearTableResults(indications_table);
    
    data.forEach(function(d) {
      return indications_table.row.add([d.drug.name, options[d.kind], getUsage(d), d.off_label, d.otc_use]);
    });

    return indications_table.draw();

  };

$(document).ready(function() {
        
    if (document.getElementById("kind_select")) {
        options = {};

        Array.apply(null, document.getElementById("kind_select").options).forEach((o) => {
            return options[o.value] = o.text;
        });

    }
    
    var indications_table = $('.indications-table').DataTable({
        order: [[0, "asc"]]
    });
    
    // Search indications when form is submitted.
    $("#indications-tutorial #indication_search").on("click", function(e) {
        var indications_params, kind, more, off_label, otc_use, q, url;
        
        e.preventDefault();
        e.stopPropagation();
        
        // If we have a search term
        if ($("#indication_name").val()) {
            
            $("#indication_name").removeClass("error");
            $("#loader").show();
            
            q = $("#indication_name").val();
            more = $("#specificity_select").val();
            kind = $("#kind_select").val();
            off_label = $("#off_label_select").val();
            otc_use = $("#otc_use_select").val();
            indications_params = "?q=" + q;
            
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
                    var search_url = encodeURI(api_route + indications_params);
                    displayRequest(search_url, data);

                    // Update the results table
                    loadTableResults(indications_table, data, options);
                    return $("#loader").hide();

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    $("#loader").hide();
                    return handleError(jqXHR, "#indication_name");
                }
            });

        } else {
            return $("#indication_name").addClass("error");
        }

    });
    
});