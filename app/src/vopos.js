/**
 * Calculates VOPOS - Value Over Position
 *
 * This metric attemps to capture upcoming dropoffs in production for a
 * position. It will be updated to reflect currently available players on
 * every data change.
 */
(function(window, undefined) {
 'use strict';

window.vopos = function(inputEstimates, numTeams) {
    var lookAhead = Math.floor(numTeams / 2);

    var getFreeUpcomingPlayers = function(posRank, posList) {
        var startIndex = posRank + 1;
        var freeUpcomingPlayers = [];
        for (var i = startIndex; i < posList.length; i++) {
            if (freeUpcomingPlayers.length >= lookAhead) {
                break;
            }
            if (!posList[i].free) {
                continue;
            }
            freeUpcomingPlayers.push(posList[i]);
        }
        return freeUpcomingPlayers;
    };

    forEveryPlayer(inputEstimates, function(player, posRank, posList) {
        if (player.free) {
            var freeUpcomingPlayers = getFreeUpcomingPlayers(posRank, posList);
            var upcomingAverage = averagePoints(freeUpcomingPlayers);
            player.vopos = player.points - upcomingAverage;
        }
    });
};

})(window);
