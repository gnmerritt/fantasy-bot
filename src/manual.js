(function(document, window, undefined) {
 'use strict';

window.ManualDraft = function(config) {
    var CHANGE_EVENT = "manualChange"
    , CLOSE_POPUP = "popupClose"

    , updateRecommendation = function() {

    }

    , addRow = function(table, row) {
        table.append("<tr>" + row.html() + "</tr>");
    }

    , setupDrafted = function() {
        $("#drafted").append("<table></table");
        addRow($("#drafted table"), $(".potential .head"));
    }

    , showButtons = function( event ) {
        var playerRow = $(event.target).closest("tr")
        , offset = playerRow.offset()
        , css = {
            display: "block"
            , left: event.clientX + 'px'
            , top: event.clientY + 'px'
        }
        , closeFunc = function() {
            $("#manualPopup").removeAttr("style");
            playerRow.removeClass("hasId");
        }
        , removePlayer = function() {
            $(window).trigger(CLOSE_POPUP);
            playerRow.remove();
            $(window).trigger(CHANGE_EVENT);
        }
        , draftPlayer = function() {
            addRow($("#drafted table"), playerRow);
            playerRow.remove();
            $(window).trigger(CLOSE_POPUP);
            $(window).trigger(CHANGE_EVENT);
        }
        ;
        $(window).trigger(CLOSE_POPUP);
        $(window).one(CLOSE_POPUP, closeFunc);

        // open the popup
        render("manualPopup", {}, "#manualPopup", function() {
            $("#manualPopup").css(css);
            playerRow.addClass("hasId");

            // attach handlers
            $("#manualPopup .draft").one("click", draftPlayer);
            $("#manualPopup .remove").one("click", removePlayer);
            $("#manualPopup .close").one("click", function() {
                $(window).trigger(CLOSE_POPUP);
            });
        });
    }

    , attachHandlers = function() {
        $(".potential tr").not(".head").on("click", showButtons);
    }
    ;

    //
    // Set up the manual drafting page & handlers
    //
    setupDrafted();
    attachHandlers();
    $(window).on(CHANGE_EVENT, updateRecommendation);
};

})(document, window);
