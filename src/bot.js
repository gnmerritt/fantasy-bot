/**
 * Fantasy Football drafting bot
 *
 * Data & config variables should be included on the page
 */
(function(document, window, undefined) {
 'use strict';

window.FantasyDrafter = function(config) {
    var BENCH = "BN"
    , BENCH_SLOTS = {"BN":true, "K":true, "DST":true}

    // events
    , GOT_INFO = "gotDraftInfo"
    , DATA_CHANGE = "dataChange"
    , DRAFTED_PLAYER = "drafted"

    // info about the draft
    , teamId
    , draftInfo
    , roster = []
    , bench = []
    , alreadyDrafted = []

    , playerEstimates = {}

    , call = makeCall(config) // API interacting function

    , pick = function( player ) {
        var pickUrl = ["pick_player", player.id].join("/")
        ;
        log("trying to draft: " + player.first_name + " " + player.last_name);
        call(pickUrl, function(data) {
            log("drafted player, got msg back: "+ data.message);
            if (data.code !== 200) {
                pickIfActive();
            }
        });
    }

    , drawPotentials = function() {
        render("potentials", {
            'players': playersByVorp(playerEstimates)
        }, "#players");
    }

    , updatePlayerAvailability = function(callback) {
        var updated = 0;
        $.each(playersByVorp(playerEstimates), function(i, player) {
            if (!player.id || !!player.taken || updated > 50) {
                return;
            }
            updated++;
            call(["player", player.id, "status"].join("/"), function(data) {
                if ( !data ) {
                    return;
                }
                if ( data.fantasy_team ) {
                    player.taken = true;
                    player.free = false;
                }
                else {
                    player.free = true;
                }
                $(window).trigger(DATA_CHANGE);
            });
        });

        // TODO: this will run before all checks are done
        if ($.isFunction(callback)) {
            callback();
        }
    }

    , updatePicks = function() {
        call("picks", function(data) {
            var myTeam = function(ele) {
                return ele.team.id == teamId;
            }
            , mine = data.picks.filter(myTeam)
            ;
            render("pickList", {'mine':mine}, "#picks");
        });
    }

    , pickIfActive = function() {
        var  picks = $('#picks')
        , active = picks.find('.active')
        , player
        ;
        if ( active.length ) {
            log("Active! Picking...");
            updatePlayerAvailability(function() {
                player = getTopPlayer();
                pick(player);
            });
        }
    }

    , getTopPlayer = function() {
        var player
        , needPosition = function(pos) {
            return true; // TODO
        }
        ;
        $.each(playersByVorp(playerEstimates), function(i, p) {
            if (p.free && needPosition(p.pos)) {
                player = p;
                return false;
            }
        });
        return player;
    }

    , getTeam = function() {
        call("team", function(data) {
            teamId = data.id;
            render("team", data, "#team");
            render("drafted", {'players':data.players}, "#drafted");
            alreadyDrafted = [];
            $.each(data.players, function(i, p) {
                alreadyDrafted.push(p.fantasy_position);
            });
        });
    }

    , getDraftInfo = function() {
        if (config.MANUAL) {
            log("Using manual draft information");
            getRoster(config.ROSTER, config.ROSTER_SLOTS);
            draftInfo = {
                name: "MANUAL DRAFT"
                , roster: {description: config.ROSTER,
                           slots: config.ROSTER_SLOTS}
                , numTeams: config.TEAMS
            };
            render("draft", {"draft": draftInfo}, "#draft");
            $(window).trigger(GOT_INFO);
            return;
        }
        call("draft", function(data) {
            render("draft", {"draft": data}, "#draft");
            getRoster(data.roster.description, data.roster.slots);
            draftInfo = data;
            draftInfo.numTeams = draftInfo.teams.length;
            $(window).trigger(GOT_INFO);
        });
    }

    , getRoster = function( description, slots ) {
        var rosterList = description.split(/,\s*/)
        ;
        bench = [];
        roster = [];
        $.each(rosterList, function(i, pos) {
            if (BENCH_SLOTS[pos]) {
                bench.push(pos);
            }
            else {
                roster.push(pos);
            }
        });
        if (bench.length + roster.length != slots) {
            log("WARNING: possible problem finding roster");
        }
    }

    , refresh = function() {
        getTeam();
        updatePicks();
    }

    , afterDraftInfo = function() {
        // Stage 1: calculate vorp for players
        playerEstimates = vorp(PLAYER_POINTS // input data
                               , roster.concat(bench) // full roster
                               , draftInfo.numTeams); // # teams
        // Stage 2: match players to draft API. The matcher will decorate
        // the existing playerEstimates object for us as it finds matches
        if (!config.MANUAL) {
            new IdMatcher(playerEstimates, config).match();
        }

        $(window).on(DATA_CHANGE, drawPotentials);

        // Finally, set up any polling or click listening functions
        if (!config.MANUAL) {
            refresh();
            setTimeout(updatePlayerAvailability, 10 * 1000);

            setInterval(refresh, 10 * 1000);
            setInterval(pickIfActive, 1.5 * 1000);
            setInterval(updatePlayerAvailability, 30 * 1000);
        }
        else {
            new ManualDraft(playerEstimates, config);
            $(window).on(DRAFTED_PLAYER, function(e, pos) {
                alreadyDrafted.push(pos);
            });
        }
    }
    ;

    return {
        DRAFTED: DRAFTED_PLAYER
        , UPDATE: DATA_CHANGE

        , init: function() {
            $(window).on(GOT_INFO, afterDraftInfo);
            getDraftInfo();
        }

        , getNext: getTopPlayer
    };
};

})(document, window);
