/**
 * Calculates value-over-replacement for players by position
 *
 * Inputs:
 *   player names & estimated points
 *   position slots per fantasy team roster
 *   number of fantasy teams in the league
 * Output:
 *   Decorated input object with VORP added to each player
 */
(function(document, window, undefined) {
 'use strict';

/**
 * Calculates demand for starters @ a position. Assign equal demand for all
 * positions in a flex slot.
 */
 window.getTeamDemand = function(position, draftRoster) {
    var demand = 0;
    $.each(draftRoster, function(_, slot) {
        var flexOptions = slot.split("/").length
        ;
        if (slot.indexOf(position) != -1) {
            demand += (1 / flexOptions);
        }
    });
    return demand;
};

window.vorp = function(pointEstimates, draftRoster, numTeams) {
    var POSITIONS = ["QB", "RB", "WR", "TE", "K", "DST"]
    , REPLACEMENT_RANGE = 3

    /**
     * Calculates replacement value by estimating demand for each
     * position, and then averaging the projected value of the
     * next three available players at the position
     */
    , getReplacementValue = function(position, inputEstimates) {
        var teamDemand = window.getTeamDemand(position, draftRoster)
        , totalDemand = teamDemand * numTeams

        , players = inputEstimates[position] || []
        , replacementStart = Math.min(Math.ceil(totalDemand),
                                      players.length - 1)
        , replacementStop = replacementStart + REPLACEMENT_RANGE
        , replacementPlayers = players.slice(replacementStart, replacementStop)

        , replacementValue = averagePoints(replacementPlayers)
        ;
        log(position + " replacement range " + replacementStart + " - " + replacementStop);
        return replacementValue.toFixed(2);
    }

    /**
     * Returns a map of position -> replacement value
     */
    , calculateReplacementValues = function(inputEstimates) {
        var replacementValues = {};
        $.each(POSITIONS, function(_, pos) {
            replacementValues[pos] = getReplacementValue(pos, inputEstimates);
        });
        return replacementValues;
    }

    , sortInput = function(estimates) {
        // sort all the lists (positions) by point total, descending
        $.each(estimates, function(position, playerList) {
            playerList.sort(function(a,b) { return b.points - a.points; });
        });
        return estimates;
    }

    //
    // Now do the real work. Clean the input, calculate replacement values
    // and return a decorated version of the input object with vorp
    //
    , inputEstimates = sortInput(pointEstimates)
    , replacementValues = calculateReplacementValues(inputEstimates)
    ;

    log("running VORP for " + numTeams + " teams, roster: " + draftRoster);
    log("replacementValues: " + JSON.stringify(replacementValues));

    forEveryPlayer(inputEstimates, function(player, pos_rank) {
        player.vorp = (player.points - replacementValues[player.pos]);
        player.pos_rank = pos_rank + 1;
    });

    return inputEstimates;
};

})(document, window);
