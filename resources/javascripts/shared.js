var localhost = "/api/"; // for connecting to the locally hosted server

highlight_name = function(concept) {
    var name = concept.name;
    concept.hits.forEach(function(h) {
        name = name.replace(strip_em_tags(h.value), h.value);
    });
    return name;
};

strip_em_tags = function(text) {
    return text.replace(/<\/?em>/g, "");
};

em_to_u_tags = function(text) {
    text = text.replace("<em>", "<u>").replace("</em>", "</u>");
    if (text.includes("<em>")) {
        return em_to_u_tags(text);
    } else {
        return text;
    }
};

clearTableResults = function(table) {
    table.clear().draw();
};

// Display the API request and response on the page
displayRequest = function(url, data) {
    $(".http-request").html("GET " + url);
    $(".shell-command").html("curl -L '" + url + "' -H 'Authorization: mytoken'");
    $(".api-response").html(Prism.highlight(JSON.stringify((data), null, 2), Prism.languages.json));
};

// Clear the API request and response display on the page
clearDisplayRequest = function() {
    $(".http-request").html(null);
    $(".shell-command").html(null);
    $(".api-response").html(null);
};

handleError = function(jqXHR, element) {
    var message;
    if ((jqXHR.status && jqXHR.status === 0) || (jqXHR.statusText && jqXHR.statusText === 'abort')) {
        return;
    } else {
        $(element).val(null).trigger('change');
        try {
            if ($.parseJSON(jqXHR.responseText).errors) {
                message = $.parseJSON(jqXHR.responseText).errors.join();
            } else {
                message = jqXHR.responseText;
            }
        } catch (_error) {
            message = jqXHR.responseText || "Error accessing " + api_host;
        }
        return alert(message.replace(/(<([^>]+)>)/ig,"") + ". Please wait and try again or contact the DrugBank Team.");
    }
};

/**
 * Javascript for underlining menu items.
 * Credit: https://css-tricks.com/jquery-magicline-navigation
 */
navUnderlineSetup = function() {

    // First add the underline to the navbar
    $(".navbar-nav").append("<li id='magic-line'></li>");
   
    var $magicLine = $("#magic-line");
    var $el, leftPos, newWidth;

    // The not("#magic-line") is here because the console will through errors
    // if you hover over the magic line because it has no children
    $(".brand-image, .navbar-nav li").not("#magic-line").hover(
        function() {
            $el = $(this).children();
            leftPos = $el.position().left;
            newWidth = $el.parent().width();
            $magicLine.stop().animate({
                left: leftPos,
                width: newWidth
            });
        },
        function() {
            $magicLine.stop().animate({
                left: $magicLine.data("origLeft"),
                width: $magicLine.data("origWidth")
            });
        }
    );
    
    navUnderlineMover(); // initial move into position

    // if the window is resized, the magic-line values 
    // need to be updated to work properly
    window.addEventListener("resize", navUnderlineMover());

};

/**
 * Moves the underline on nav items to the correct position.
 * Called on setup to get initial location, then called whenever
 * the window is resized.
 */
navUnderlineMover = function() {
    $("#magic-line")
        .width($(".active").children().width())
        .css("left", $(".active a").position().left)
        .data("origLeft", $("#magic-line").position().left)
        .data("origWidth", $("#magic-line").width());   
} 