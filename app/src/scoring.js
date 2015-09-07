/**
 * Scoring system manager, converts a set of projected stats into a
 * points total depending on the system
 */
(function(document, window, undefined) {
 'use strict';

window.scoring = function(playerInput, config) {
    var DEFAULT_SYSTEM = "YAHOO"

    , scoring_name = config.SCORING || DEFAULT_SYSTEM
    , scoring = SCORING[scoring_name]

    , calculatePoints = function(player) {
        var total = 0;
        $.each(player, function(stat, count) {
            if ($.isNumeric(scoring[stat])) {
                total += count * scoring[stat];
            }
        });
        player.points = total;
    }
    ;
    log("Calculating fantasy points using " + scoring_name);
    forEveryPlayer(playerInput, calculatePoints);
    return playerInput;
};

})(document, window);
