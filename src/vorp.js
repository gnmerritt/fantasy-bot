/**
 * Calculates value-over-replacement for players by position
 *
 * Inputs:
 *   player names & estimated points
 *   position slots per fantasy team roster
 *   number of fantasy teams in the league
 * Output:
 *
 */
(function(document, window, undefined) {

window.vorp = function(pointEstimates, draftRoster, draftTeams) {
    var POSITIONS = ["QB", "RB", "WR", "TE", "K", "DST"]

    , replacementValues // map position -> replacement points

    , getReplacementValue = function(position) {
        var teamDemand = getTeamDemand(position)
        , totalDemand = teamDemand * draftTeams
        ;
        console.log(position + " total: " + totalDemand + " team: " + teamDemand);
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

    , calculateReplacements = function() {
        replacementValues = {};
        $.each(POSITIONS, function(_, pos) {
            replacementValues[pos] = getReplacementValue(pos);
        });
    }
    ;

    calculateReplacements();

    return replacementValues;
};

})(document, window);

$(document).ready(function() {
    vorp(PLAYER_POINTS,
         ["QB", "RB", "RB", "WR", "WR", "WR", "TE", "RB/WR/TE", "K", "DST", "BN", "BN", "BN", "BN", "BN"],
         10);
});
