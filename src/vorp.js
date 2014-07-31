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

window.vorp = function(pointEstimates, draftRoster, draftTeams) {
    var POSITIONS = ["QB", "RB", "WR", "TE", "K", "DST"]

    /**
     * Calculates replacement value by estimating demand for each
     * position, and then averaging the projected value of the next
     * 10% of available players at the position
     */
    , getReplacementValue = function(position, inputEstimates) {
        var teamDemand = getTeamDemand(position)
        , totalDemand = teamDemand * draftTeams

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

    , averagePoints = function(players) {
        var total = 0;
        $.each(players, function(_, player) {
            total += player.points;
        });
        return total / Math.max(players.length, 1);
    }

    /**
     * Calculates demand for a position. Assign equal demand for all
     * positions in a flex slot, and equal weight across all positions
     * for bench slots.
     */
    , getTeamDemand = function(position) {
        var demand = 0;
        $.each(draftRoster, function(_, slot) {
            var flexOptions = slot.split("/").length
            // Don't include kickers - nobody will have a backup kicker.
            , positionOptions = POSITIONS.length - 1
            ;
            if (slot.indexOf(position) != -1) {
                demand += (1 / flexOptions);
            }
            else if (slot === "BN" && position !== "K") {
                demand += (1 / positionOptions);
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

    /**
     * Call the action function for every player
     */
    , forEveryPlayer = function(input, action) {
        $.each(input, function(pos, playerList) {
            $.each(playerList, function(i, player) {
                action(player);
            });
        });
    }

    , cleanInput = function(input) {
        var estimates = JSON.parse(JSON.stringify(input)) // :-P
        ;
        // convert player points to a float
        forEveryPlayer(estimates, function(player) {
            var pointsStr = player.points
            pointsFloat = parseFloat(pointsStr)
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
    // and return a decorated version of the input object with vorb
    //
    , inputEstimates = cleanInput(pointEstimates)
    , replacementValues = calculateReplacementValues(inputEstimates)
    ;

    forEveryPlayer(inputEstimates, function(player) {
        player.vorb = player.points - replacementValues[player.pos];
    });

    return inputEstimates;
};

})(document, window);

$(document).ready(function() {
    vorp(PLAYER_POINTS,
         ["QB", "RB", "RB", "WR", "WR", "WR", "TE", "RB/WR/TE", "K", "DST", "BN", "BN", "BN", "BN", "BN"],
         10);
});
