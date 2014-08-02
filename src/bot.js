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
    , urlPrefix = ["http://", config.HOST, config.PREFIX].join("")

    // info about the draft
    , teamId
    , draftInfo
    , roster = []
    , bench = []

    , foundPlayers
    , playerEstimates = {}

    , withKey = function( url ) {
        return url + "?key=" + config.KEY;
    }

    , call = function( method, callback, type ) {
        var url = withKey( urlPrefix + method )
        , verb = type || "GET"
        ;
        $.ajax({
            type: verb,
            url: url,
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            success: callback
        });
    }

    , pick = function( playerid ) {
        var pickUrl = ["pick_player", playerid].join("/")
        ;
        call(pickUrl, function(data) {
            log("drafted player, got msg back: "+ data.message);
        });
    }

    , drawPotentials = function() {
        var potentials = []
        ;
        forEveryPlayer(playerEstimates, function(p) {
            potentials.push(p);
        });
        potentials.sort(function(a,b) { return b.vorp - a.vorp; });
        render("potentials", {
            'players': potentials
        }, "#players");
    }

    , updatePotentials = function() {
        var checkPlayer = function(i, ele )  {
            var id = $(ele).data("id")
            url = ["player", id, "status"].join("/")
            ;
            call(url, function(data) {
                if ( data && data.fantasy_team ) {
                    $(ele).remove();
                }
                else {
                    $(ele).addClass("free");
                }
            });
        }
        ;
        log("Updating potential players");

        $(".potential tr").not(".head").filter(":visible").each(checkPlayer);

        // make sure that there's one available player of each type, so
        // we don't skip picks
        $.each(roster, function(_, pos) {
            var ele = $(".potential tr").filter("[data-pos="+pos+"]")[0];
            checkPlayer(0, ele);
        });
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
        , my_pick_index = 0
        , position
        ;
        if ( active.length ) {
            log("Active! Picking...");
            updatePotentials();
            picks.find("li").each(function(i, ele) {
                if ( $(ele).is(active) ) {
                    my_pick_index = i + 1;
                }
            });
            if (my_pick_index > 0) {
                position = roster[my_pick_index];
                pick(getTopPlayerId(position));
            }
        }
        else {
            log("Not my pick");
        }
    }

    , getTopPlayerId = function(pos) {
        var ele = $("#players .free").filter("[data-pos="+pos+"]")[0]
        , id = $(ele).data("id");
        log("trying to draft: " + $(ele).find(".n").html());
        return id;
    }

    , getTeam = function() {
        call("team", function(data) {
            teamId = data.id;
            render("team", data, "#team");
            addApiLinkToPlayers(data.players);
            render("drafted", {'players':data.players}, "#drafted");
        });
    }

    , playerSearch = function() {
        foundPlayers = 0;
        $("#found").html('');
        $.each(PLAYER_RANKINGS, function(i, player) {
            search(player);
        });
    }

    , search = function( player_list ) {
        var first_name = player_list[1].toLowerCase()
        , last_name = player_list[2]
        , position = player_list[4]
        , searchUrl = ["search",
                       "name", last_name,
                       "pos", position].join("/")
        , gotId = function(match) {
            if ( player_list.length == 7) {
                player_list.pop(); // remove the old id
            }
            player_list.push(match.id);
            $("#found").append('<div>' + player_list + '</div>');
            $(".found").html(++foundPlayers);
        }
        ;
        call(searchUrl, function(data) {
            // Only got one match back, trust it
            if ( data.results && data.results.length == 1 ) {
                gotId(data.results[0]);
            }
            else if ( data.results ) { // Look a little harder
                $.each(data.results, function(i, result) {
                    var resultName = result.first_name.toLowerCase();
                    if ( resultName.indexOf(first_name) > -1 ) {
                        gotId(result);
                    }
                });
            }
        });
    }

    , addApiLinkToPlayers = function( players ) {
        $.each(players, function(i, ele) {
            addApiLink( ele );
        });
    }

    , addApiLink = function( player ) {
        player.url = withKey( urlPrefix + "player/" + player.id + "/status" );
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
        var rosterList = description.split(', ')
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
        setTimeout(refresh, 10000);
        setTimeout(pickIfActive, 1500);
    }

    , afterDraftInfo = function() {
        // Stage 1: calculate vorp for players
        playerEstimates = vorp(PLAYER_POINTS // input data
                               , roster.concat(bench) // full roster
                               , draftInfo.numTeams); // # teams
        // Stage 2: match players to draft API
        if (!config.MANUAL) {
            var matched = (new IdMatcher(playerEstimates)).match();
        }

        drawPotentials();

        if (!config.MANUAL) {
            /*
              refresh();
              updatePotentials();
              // and update once every 30 seconds
              setInterval(updatePotentials, 30000);
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

        , pick: function() {
            pickIfActive();
        }
    };
};

})(document, window);
