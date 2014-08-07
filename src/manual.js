(function(document, window, undefined) {
 'use strict';

/**
 * Manual draft helper - adds a click handler to draft or mark players
 * as removed.
 */
window.ManualDraft = function(playerEstimates, config) {
    var CLOSE_POPUP = "popupClose"

    , addRow = function(table, row) {
        table.append("<tr>" + row.html() + "</tr>");
    }

    , setupDrafted = function() {
        $("#drafted").append("<table></table");
        addRow($("#drafted table"), $(".potential .head"));
    }

    , tweakPlayers = function() {
        $(".potential").addClass("showAll");
        $(".potential tr").removeClass("free");
    }

    , findByName = function(rowName) {
        var match;
        forEveryPlayer(playerEstimates, function(p) {
            var name = p.first_name + " " + p.last_name;
            if (name === rowName) {
                match = p;
            }
        });
        return match;
    }

    , showButtons = function( event ) {
        var playerRow = $(event.target).closest("tr")
        , offset = playerRow.offset()
        , css = {
            display: "block"
            , left: event.clientX + 'px'
            , top: event.clientY + $(window).scrollTop() + 'px'
        }
        , closeFunc = function() {
            $("#manualPopup").removeAttr("style");
            playerRow.removeClass("hasId");
        }
        , removePlayer = function() {
            var player = findByName(playerRow.find(".n").html());
            player.free = false;
            playerRow.remove();
            $(window).trigger(CLOSE_POPUP);
            $(window).trigger(window.ff.NEW_REC);
        }
        , draftPlayer = function() {
            addRow($("#drafted table"), playerRow);
            $(window).trigger(window.ff.DRAFTED, playerRow.data("pos"));
            removePlayer();
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
    // Mark all players as free since this is a manual draft
    forEveryPlayer(playerEstimates, function(p) {
        p.free = true;
    });
    $(window).trigger(window.ff.UPDATE);
    setTimeout(tweakPlayers, 500);

    setupDrafted();
    attachHandlers();

    window.onbeforeunload = function() {
        return 'Warning: reloading will lose draft progress';
    }
};

})(document, window);
