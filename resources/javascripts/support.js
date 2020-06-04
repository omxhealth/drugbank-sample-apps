


$(document).ready(function() {

    // Request the current API key for display
    $.ajax({
        url: "/auth_key", 
        success: function(result){
            $("#auth_key_input").val(result);
        }
    })

    /**
     * On submission, send a JSON with the new key to the server.
     * The server processes the request, and returns a message and whether 
     * the key update was successful or not through http status code.
     * This is a "PUT" request, as a value at the server is being 
     * updated.
     */
    $("#auth_key_submit").on("click", function(e) {
        
        e.preventDefault();
        e.stopPropagation();

        return $.ajax({
            url: "/auth_key",
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                q: encodeURI($("#auth_key_input").val())
            }),
            dataType: "json",
            success: function(result){
                $("#auth_update_message").text((result)["message"]); // set message
                $("#auth_key_updated").css("display", "inline-block"); // display message
            },

            // An error is caused by either the new key being empty
            // or by being unable to open "config.json" to save
            error: function(xhr) {
                $("#auth_key_input").val((result)["original-key"]); // put original key
                $("#auth_update_message").text((result)["message"]); // set message
                $("#auth_key_updated").css("display", "inline-block"); // display message
            }

        });

    });

    // Prevent the enter key from submitting the form
    $("#auth_key_form").keypress(
        function(event){
          if (event.which == '13') {
            event.preventDefault();
          }
      });
    
});