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
    , GOT_INFO = "gotDraftInfo"

    // info about the draft
    , teamId
    , draftInfo
    , roster = []
    , bench = []

    , playerEstimates = {}

    , call = makeCall(config) // API interacting function

    , pick = function( playerid ) {
        var pickUrl = ["pick_player", playerid].join("/")
        ;
        log("trying to draft: " + $(ele).find(".n").html());
        call(pickUrl, function(data) {
            log("drafted player, got msg back: "+ data.message);
        });
    }

    , drawPotentials = function() {
        render("potentials", {
            'players': playersByVorp(playerEstimates)
        }, "#players");
    }

    , updatePotentials = function(callback) {
        log("Updating potential players");
        forEveryPlayer(playerEstimates, function(player) {
            if (!player.id || !!player.taken) {
                return;
            }
            call(["player", player.id, "status"].join("/"), function(data) {
                if ( data && data.fantasy_team ) {
                    player.taken = true;
                }
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
        , playerId
        ;
        if ( active.length ) {
            log("Active! Picking...");
            updatePotentials(function() {
                playerId = getTopPlayerId();
                pick(playerId);
            });
        }
        else {
            log("Not my pick");
        }
    }

    , getTopPlayerId = function() {
        var ele = $("#players .player")[0]
        , id = $(ele).data("id")
        ;
        // TODO: only get top player in a position we need
        return id;
    }

    , getTeam = function() {
        call("team", function(data) {
            teamId = data.id;
            render("team", data, "#team");
            render("drafted", {'players':data.players}, "#drafted");
        });
    }

    , getDraftInfo = function() {
        if (config.MANUAL) {
            log("Using manual draft information");
            getRoster(config.ROSTER, config.ROSTER_SLOTS);
            draftInfo = {
                numTeams: config.TEAMS
            };
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
        log("Refreshing...");
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

        drawPotentials();

        if (!config.MANUAL) {
            refresh();
            updatePotentials();
            /*
              setInterval(drawPotentials, 5 * 1000);
              setInterval(refresh, 10 * 1000);
              setInterval(pickIfActive, 1.5 * 1000);
              setInterval(updatePotentials, 30 * 1000);
            */
        }
        else {
            // TODO: set up manual click handlers
        }
    }
    ;

    return {
        init: function() {
            $(window).on(GOT_INFO, afterDraftInfo);
            getDraftInfo();
        }

        , updatePicked: function() {
            updatePotentials();
        }

        , redraw: function() {
            drawPotentials();
        }

        , pick: function() {
            pickIfActive();
        }
    };
};

})(document, window);
