var CONFIG = {};

/**
 * Draft configuration profiles
 */
(function() {

var defaults = {
    HOST: "draft.gnmerritt.net"
    , PREFIX: "/api/v1/"
    , SCORING: "YAHOO"
};

var manual = {
    KEY: "", HOST: "", PREFIX: ""
    , MANUAL: true
};

CONFIG["AUTOBOTS-2013"] = $.extend({}, defaults, {
    KEY: "8891a052-7d14-48db-9c2c-c0a59f87e927"
});

CONFIG["AUTOBOTS-2014"] = $.extend({}, defaults, {
    KEY: "36164d39-014c-484f-b9f7-70fa07bcf6e4"
});

CONFIG["FORGET-2014"] = $.extend({}, defaults, {
    KEY: "70041038-ecb3-459d-b388-2df91a1e8057"
});

CONFIG["YAHOO"] = $.extend({}, manual, {
    ROSTER: "QB, RB, RB, WR, WR, WR, TE, K, DST, BN, BN, BN, BN, BN, BN"
    , ROSTER_SLOTS: 15
    , TEAMS: 10
});

CONFIG["ESPN"] = $.extend({}, manual, {
    ROSTER: "QB, RB, RB, WR, WR, RB/WR, TE, K, DST, BN, BN, BN, BN, BN, BN, BN"
    , ROSTER_SLOTS: 16
    , SCORING: "ESPN"
    , TEAMS: 10
});

CONFIG["CLOWN"] = $.extend({}, manual, {
    ROSTER: "QB, RB, RB, WR, WR, TE, WR/RB, K, DST, BN, BN, BN, BN"
    , ROSTER_SLOTS: 13
    , TEAMS: 12
    , SCORING: "CLOWN"
});

})();
