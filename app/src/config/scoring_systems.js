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

    // points allowed
    , "0": 10
    , "1-6": 7
    , "7-13": 4
    , "14-20": 1
    , "21-27": 0
    , "28-34": -1
    , "35": -4

    // Turnovers
    , "fumbles": -2
    , "pass_ints": -1

    // Rushing
    , "rush_yds": 0.1
    , "rush_tds": 6

    // Receiving
    , "rec_yds": 0.1
    , "rec_tds": 6

    // Passing
    , "pass_yds": 0.04
    , "pass_tds": 4

    // Kickers
    , "fgs": 3
    , "xpt": 1
};

SCORING["YAHOO"] = $.extend({}, SCORING_BASE);

SCORING["ESPN"] = $.extend({}, SCORING_BASE, {
    "pass_ints": -2
    // TODO: defensive allowed yards
    // TODO: defensive points allowed
    // TODO: field goal misses
});

var one_thirtieth = 1/30
 , one_fifteenth = 1/15
 ;

SCORING["CLOWN"] = $.extend({}, SCORING_BASE, {
    "pass_yds": one_thirtieth
    , "pass_ints": -2
    , "rush_yds": one_fifteenth
    , "rec_yds": one_fifteenth
});

})(document, window);
