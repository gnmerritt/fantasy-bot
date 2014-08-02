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

window.vorp = function(pointEstimates, draftRoster, numTeams) {
    var POSITIONS = ["QB", "RB", "WR", "TE", "K", "DST"]

    /**
     * Calculates replacement value by estimating demand for each
     * position, and then averaging the projected value of the next
     * 10% of available players at the position
     */
    , getReplacementValue = function(position, inputEstimates) {
        var teamDemand = getTeamDemand(position)
        , totalDemand = teamDemand * numTeams

        , players = inputEstimates[position] || []
        , replacementStart = Math.min(Math.ceil(totalDemand),
                                      players.length - 1)
        , replacementRange = players.length * 0.1
        , replacementStop = replacementStart + replacementRange
        , replacementPlayers = players.slice(replacementStart, replacementStop)

        , replacementValue = averagePoints(replacementPlayers)
        ;
        return replacementValue;
    }

    /**
     * Calculates demand for starters @ a position. Assign equal demand for all
     * positions in a flex slot.
     */
    , getTeamDemand = function(position) {
        var demand = 0;
        $.each(draftRoster, function(_, slot) {
            var flexOptions = slot.split("/").length
            ;
            if (slot.indexOf(position) != -1) {
                demand += (1 / flexOptions);
            }
        });
        return demand;
    }

    /**
     * Returns a map of position -> replacement value
     */
    , calculateReplacementValues = function(inputEstimates) {
        var replacementValues = {};
        $.each(POSITIONS, function(_, pos) {
            replacementValues[pos] = getReplacementValue(pos, inputEstimates);
        });
        return replacementValues
    }

    , cleanInput = function(input) {
        var estimates = JSON.parse(JSON.stringify(input)) // :-P
        ;
        // convert player points to a float
        forEveryPlayer(estimates, function(player) {
            var pointsStr = player.points
            , pointsFloat = parseFloat(pointsStr)
            ;
            player.points = pointsFloat;
        });
        // now sort all the lists by point total, descending
        $.each(estimates, function(position, playerList) {
            playerList.sort(function(a,b) { return b.points - a.points; });
        });
        return estimates;
    }

    //
    // Now do the real work. Clean the input, calculate replacement values
    // and return a decorated version of the input object with vorp
    //
    , inputEstimates = cleanInput(pointEstimates)
    , replacementValues = calculateReplacementValues(inputEstimates)
    ;

    console.log("running for " + numTeams + " teams, roster: " + draftRoster);
    console.log("replacementValues: " + JSON.stringify(replacementValues));

    forEveryPlayer(inputEstimates, function(player) {
        player.vorp = (player.points - replacementValues[player.pos]).toFixed(2);
    });

    return inputEstimates;
};

})(document, window);
