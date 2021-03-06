var SCORING = {};

(function(document, window, undefined) {

var SCORING_BASE = {
    // Defense/Special Teams
    "sacks": 1
    , "int": 2
    , "fumble_rec": 2
    , "safety": 2
    , "block_kick": 2
    , "def_td": 6
    , "ret_yds": 0

    // points allowed
    , "0": 10
    , "1-6": 7
    , "7-13": 4
    , "14-17": 1
    , "18-20": 1
    , "21-27": 0
    , "28-34": -1
    , "35-45": -4
    , "46+": -4

    // Turnovers
    , "fumbles": -2
    , "pass_ints": -1

    // Rushing
    , "rush_yds": 0.1
    , "rush_tds": 6

    // Receiving
    , "rec_yds": 0.1
    , "rec_tds": 6
    , "rec": 0

    // Passing
    , "pass_yds": 0.04
    , "pass_tds": 4

    // Bonuses
    , "pass_300+": 0
    , "field_100+": 0  // rush or rec

    // Kickers
    , "fgs": 3
    , "xpt": 1
};

SCORING["YAHOO"] = $.extend({}, SCORING_BASE);

SCORING["PPR"] = $.extend({}, SCORING_BASE, {
    "rec": 1
});

SCORING["ESPN"] = $.extend({}, SCORING_BASE, {
    "pass_ints": -2
    // TODO: defensive allowed yards
    // TODO: defensive points allowed
    // TODO: field goal misses
});

SCORING["MARKET"] = $.extend({}, SCORING_BASE, {
    "pass_300+": 2,
    "field_100+": 2
});

SCORING["DUFF"] = $.extend({}, SCORING_BASE, {
    "rec": 0.2
});

})(document, window);
