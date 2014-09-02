/* example config file */
CONFIG["DEBUG"] = {
    KEY: "8891a052-7d14-48db-9c2c-c0a59f87e927"
    , HOST:"localhost:8000/d"
    , PREFIX: "/api/v1/"
};

CONFIG["PROD-2013"] = {
    KEY: "8891a052-7d14-48db-9c2c-c0a59f87e927"
    , HOST: "draft.gnmerritt.net"
    , PREFIX: "/api/v1/"
};

CONFIG["YAHOO-MOCK"] = {
    KEY: "", HOST: "", PREFIX: ""
    , MANUAL: true
    , ROSTER: "QB, RB, RB, WR, WR, WR, TE, K, DST, BN, BN, BN, BN, BN, BN"
    , ROSTER_SLOTS: 15
    , TEAMS: 10
};

CONFIG["CLOWN"] = {
    KEY: "", HOST: "", PREFIX: ""
    , MANUAL: true
    , ROSTER: "QB, RB, RB, WR, WR, TE, WR/RB, K, DST, BN, BN, BN, BN"
    , ROSTER_SLOTS: 13
    , TEAMS: 12
};
