var SCORING = {};

/**
 * Scoring system manager, converts a set of projected stats into a
 * points total depending on the system
 */
(function(document, window, undefined) {
 'use strict';

window.scoring = function(playerInput, config) {
    var DEFAULT_SYSTEM = "YAHOO"
    , GAMES_PER_SEASON = 16

    , scoring_name = config.SCORING || DEFAULT_SYSTEM
    , scoring = SCORING[scoring_name]

    , calculatePoints = function(player) {
        var totalPerGame = 0;
        $.each(player, function(stat, countPerGame) {
            if (scoring[stat] != null && $.isNumeric(scoring[stat])) {
                totalPerGame += countPerGame * scoring[stat];
            }
        });
        player.points = (totalPerGame * GAMES_PER_SEASON);
    }
    ;
    if (!scoring) {
        log("Could not find scoring: " + scoring_name);
        return {};
    }
    log("Calculating fantasy points using " + scoring_name);
    forEveryPlayer(playerInput, calculatePoints);
    return playerInput;
};

})(document, window);
