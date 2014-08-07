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
    , HIGHLIGHT_BEST = "highlightBest"

    // info about the draft
    , teamId
    , draftInfo
    , roster = []
    , bench = []
    , alreadyDrafted = []

    , playerEstimates = {}
    , idsToPlayers = {} // map of player id -> player object

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
        highlightBest();
    }

    , updatePlayerAvailability = function(callback) {
        call("draft", function(data) {
            var selections = data && data.selections || [];
            $.each(selections, function(i, s) {
                var id = s.player.id
                , player = idsToPlayers[id]
                ;
                if (player) {
                    player.taken = true;
                    player.free = false;
                }
            });
            // anyone not already picked is free
            forEveryPlayer(playerEstimates, function(p) {
                if (p.id && !p.taken) {
                    p.free = true;
                }
            });
            $(window).trigger(DATA_CHANGE);

            if ($.isFunction(callback)) {
                callback();
            }
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

    , needPosition = function(pos) {
        var ownedPositions = alreadyDrafted.slice(0)
        , neededRoster = roster.slice(0)
        , neededBench = bench.slice(0)
        ;
        $.each(ownedPositions, function(i, pos) {
            var rosterIndex = flexIndexOf(neededRoster, pos)
            , benchIndex = flexIndexOf(neededBench, pos)
            ;
            if (rosterIndex > -1) {
                neededRoster[rosterIndex] = null;
            }
            else if (benchIndex > -1) {
                neededBench[benchIndex] = null;
            }
        });
        if (flexIndexOf(neededRoster, pos) > -1) {
            log("Still need " + pos + " on roster");
            return true;
        }
        else if (alreadyDrafted.length >= neededRoster.length &&
                 flexIndexOf(neededBench, pos) > -1) {
            log("Need " + pos + " to fill out bench ");
            return true;
        }
        return false;
    }

    /**
     * Fuzzy matching replacement for indexOf that knows about flex
     * positions and bench positions
     */
    , flexIndexOf = function(array, pos) {
        var flexMatch = -1
        , benchMatch = -1
        , i
        ;
        for (i = 0; i < array.length; i++) {
            if (array[i] == null) {
                // no-op
            }
            // Real match, return
            else if (array[i] === pos) {
                return i;
            }
            // Flex position match ie 'WR' matches WR/RB
            else if (array[i].indexOf(pos) > -1) {
                flexMatch = i;
            }
            // Lowest priority: bench slot
            else if (array[i] === BENCH && flexMatch === -1) {
                benchMatch = i;
            }
        }
        return Math.max(flexMatch, benchMatch);
    }

    /**
     * Returns the next player the bot will draft
     */
    , getTopPlayer = function() {
        var player
        ;
        $.each(playersByVorp(playerEstimates), function(i, p) {
            if (p.free && needPosition(p.pos)) {
                player = p;
                return false;
            }
        });
        return player;
    }

    , highlightBest = function() {
        var bestPlayer = getTopPlayer() || {}
        , playerName = bestPlayer.first_name + " " + bestPlayer.last_name
        , matchingName
        ;
        $.each($(".potential tr .n"), function(i, n) {
            if ($(n).html() === playerName) {
                matchingName = n;
                return false;
            }
        });
        $(".potentials tr").removeClass("best");
        $(matchingName).closest("tr").addClass("best");
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
        updatePlayerAvailability();
    }

    , afterDraftInfo = function() {
        // Stage 1: calculate vorp for players
        playerEstimates = vorp(PLAYER_POINTS // input data
                               , roster.concat(bench) // full roster
                               , draftInfo.numTeams); // # teams

        // Stage 2: match players to draft API. The matcher will decorate
        // the existing playerEstimates object for us as it finds matches
        if (!config.MANUAL) {
            idsToPlayers = new IdMatcher(playerEstimates, config).match();
        }

        $(window).on(DATA_CHANGE, drawPotentials);
        $(window).on(HIGHLIGHT_BEST, highlightBest);

        // Finally, set up any polling or click listening functions
        if (!config.MANUAL) {
            refresh();
            setInterval(refresh, 10 * 1000);
            setInterval(pickIfActive, 1.5 * 1000);
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
        , NEW_REC: HIGHLIGHT_BEST

        , init: function() {
            $(window).on(GOT_INFO, afterDraftInfo);
            getDraftInfo();
        }
    };
};

})(document, window);
