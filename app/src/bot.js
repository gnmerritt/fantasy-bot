/**
 * Fantasy Football drafting bot
 *
 * Data & config variables should be included on the page
 */
(function(document, window, undefined) {
 'use strict';

window.FantasyDrafter = function(config) {
    // events
    var GOT_INFO = "gotDraftInfo"
    , DATA_CHANGE = "dataChange"
    , DRAFTED_PLAYER = "drafted"
    , AFTER_UPDATE = "onAfterUpdate"

    // info about the draft
    , teamId
    , draftInfo
    , roster // Roster manager
    , myPicks = []

    , playerEstimates = {}
    , idsToPlayers = {} // map of player id -> player object

    , currentlyPicking = false

    , call = makeCall(config) // API interacting function

    , pick = function( player ) {
        var pickUrl = ["pick_player", player.id].join("/")
        ;
        log("trying to draft: " + player.first_name + " " + player.last_name);
        call(pickUrl, function(data) {
            log("drafted player, got msg back: " + data.message +
                " (" + data.code + ")");
            // player already picked, try again
            if (data.code === 410) {
                pickIfActive();
            }
            // success!
            else if (data.code == 200) {
                refresh();
            }
        });
    }

    , drawPotentials = function() {
        vopos(playerEstimates, draftInfo.numTeams);
        render("potentials", {
            'players': playersByVorp(playerEstimates)
        }, "#players");
        highlightBest();
        $(window).trigger(AFTER_UPDATE);
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
            };
            myPicks = data.picks.filter(myTeam);
            render("pickList", {'mine': myPicks}, "#picks");
        });
    }

    , pickIfActive = function() {
        var pickFunc = function() {
            if (currentlyPicking) {
              return;
            }
            currentlyPicking = true;
            log("Active! Picking...");
            updatePlayerAvailability(function() {
                var player = getTopPlayer();
                if (player) {
                    pick(player);
                }
                currentlyPicking = false;
            });
        };
        $.each(myPicks, function(i, pick) {
            var starts = pick.starts.utc
            , ends = pick.expires.utc
            , now = now_utc()
            ;
            if (starts <= now && now <= ends) {
                pickFunc();
            }
        });
    }

    /**
     * Returns the next player the bot will draft
     */
    , getTopPlayer = function() {
        var player
        , neededPositions = {}
        ;
        $.each(playersByVorp(playerEstimates), function(i, p) {
            if (typeof(neededPositions[p.pos]) === "undefined") {
                neededPositions[p.pos] = roster.needPosition(p.pos);
            }
            if (p.free && neededPositions[p.pos]) {
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
        $(".potential tr").removeClass("best");
        $(matchingName).closest("tr").addClass("best");
    }

    , getTeam = function() {
        call("team", function(data) {
            teamId = data.id;
            render("team", data, "#team");
            render("drafted", {'players':data.players}, "#drafted");
            roster.resetDrafted();
            $.each(data.players, function(i, p) {
                roster.draftedPosition(p.fantasy_position);
            });
        });
    }

    , getDraftInfo = function() {
        if (config.MANUAL) {
            log("Using manual draft information");
            roster = new Roster(config.ROSTER, config.ROSTER_SLOTS);
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
            roster = new Roster(data.roster.description, data.roster.slots);
            draftInfo = data;
            draftInfo.numTeams = draftInfo.teams.length;
            $(window).trigger(GOT_INFO);
        });
    }

    , refresh = function() {
        getTeam();
        updatePicks();
        updatePlayerAvailability();
    }

    , afterDraftInfo = function() {
        // Stage 1: Calculate projected fantasy points based on scoring system
        var inputData = cleanInputData(PLAYER_POINTS)
        , scoredPlayers = scoring(inputData, config)
        ;
        // Stage 2: calculate vorp for players
        playerEstimates = vorp(scoredPlayers
                               , roster.fullRoster() // full roster
                               , draftInfo.numTeams); // # teams
        // 2b: calculate vopos (will be updated as draft progresses)
        vopos(playerEstimates, draftInfo.numTeams);

        // Stage 3: match players to draft API. The matcher will decorate
        // the existing playerEstimates object for us as it finds matches
        if (!config.MANUAL) {
            idsToPlayers = new IdMatcher(playerEstimates, config).match();
        }

        $(window).on(DATA_CHANGE, drawPotentials);

        // Wire up the graphs
        new Graphs(playerEstimates);

        // Finally, set up any polling or click listening functions
        if (!config.MANUAL) {
            refresh();
            setInterval(refresh, 15 * 1000);
            setInterval(pickIfActive, 2 * 1000);
        }
        else {
            new ManualDraft(playerEstimates, config);
            $(window).on(DRAFTED_PLAYER, function(e, pos) {
                roster.draftedPosition(pos);
            });
        }
    }
    ;

    return {
        DRAFTED: DRAFTED_PLAYER
        , UPDATE: DATA_CHANGE
        , AFTER_UPDATE: AFTER_UPDATE

        , init: function() {
            $(window).on(GOT_INFO, afterDraftInfo);
            getDraftInfo();
        }
    };
};

})(document, window);
