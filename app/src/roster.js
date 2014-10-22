/**
 * Functions to handle roster management
 */
(function(document, window, undefined) {
 'use strict';

window.Roster = function( description, slots ) {
    var BENCH = "BN"
    , BENCH_SLOTS = {"BN":true, "K":true, "DST":true}

    , roster = []
    , bench = []
    , alreadyDrafted = []

    , setupRoster = function( description, slots ) {
        var rosterList = description.split(/,\s*/)
        ;
        bench = [];
        roster = [];
        $.each(rosterList, function(i, pos) {
            if (BENCH_SLOTS[pos]) {
                bench.push(pos);
            }
            else {
                roster.push(pos);
            }
        });
        if (bench.length + roster.length != slots) {
            log("WARNING: possible problem finding roster");
        }
    }

    /**
     * Function to determine whether or not we need to draft another player
     * at a position. Looks through the list of already drafted positions and
     * compares against the required roster.
     *
     * Flex (RB/WR) and bench (BN) aware via a special array search function.
     */
    , needPosition = function(pos) {
        var ownedPositions = alreadyDrafted.slice(0)
        , neededRoster = roster.slice(0)
        , neededBench = bench.slice(0)
        ;
        // Special case: never draft a backup kicker.
        if (pos === "K" && ownedPositions.indexOf("K") > -1) {
            //log("No backup kickers");
            return false;
        }
        $.each(ownedPositions, function(i, pos) {
            var rosterIndex = flexIndexOf(neededRoster, pos)
            , benchIndex = flexIndexOf(neededBench, pos)
            ;
            if (rosterIndex > -1) {
                neededRoster[rosterIndex] = null;
            }
            else if (benchIndex > -1) {
                neededBench[benchIndex] = null;
            }
        });
        if (flexIndexOf(neededRoster, pos) > -1) {
            //log("Still need " + pos + " on roster");
            return true;
        }
        else if (alreadyDrafted.length >= neededRoster.length &&
                 flexIndexOf(neededBench, pos) > -1) {
            //log("Need " + pos + " to fill out bench ");
            return true;
        }
        //log("Don't need any of " + pos);
        return false;
    }

    /**
     * Fuzzy matching replacement for indexOf that knows about flex
     * positions and bench positions
     */
    , flexIndexOf = function(array, pos) {
        var flexMatch = -1
        , benchMatch = -1
        , i
        ;
        for (i = 0; i < array.length; i++) {
            if (array[i] == null) {
                // no-op
            }
            // Real match, return
            else if (array[i] === pos) {
                return i;
            }
            // Flex position match ie 'WR' matches WR/RB
            else if (array[i].indexOf(pos) > -1) {
                flexMatch = i;
            }
            // Lowest priority: bench slot
            else if (array[i] === BENCH && flexMatch === -1) {
                benchMatch = i;
            }
        }
        return Math.max(flexMatch, benchMatch);
    }
    ;

    setupRoster(description, slots);

    return {
        resetDrafted: function() { alreadyDrafted = []; }

        , draftedPosition: function(pos) { alreadyDrafted.push(pos); }

        , needPosition: needPosition

        , fullRoster: function() { return roster.concat(bench); }
    };
};

})(document, window);
