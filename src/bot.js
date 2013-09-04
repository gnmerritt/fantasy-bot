/**
 * Fantasy Football drafting bot
 *
 * Data & config variables should be included on the page
 */
ff = function(document, window, undefined) {
    var urlPrefix = ["http://", HOST, PREFIX].join("")
    , base = dust.makeBase({
        KEY: KEY
        , HOST: HOST
    })
    , teamId
    , foundPlayers

    , withKey = function( url ) {
        return url + "?key=" + KEY;
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
            console.log("drafted player, got msg back: "+ data.message);
        });
    }

    , render = function(name, data, selector) {
        dust.render(name, base.push(data), function(err, out) {
            $(selector).html(out);
        });
    }

    , drawPotentials = function() {
        var potentials = []
        ;
        $.each(PLAYER_RANKINGS, function(i, p) {
            var json = {
                'rank':p[0],
                'first_name':p[1],
                'last_name':p[2],
                'team':p[3],
                'fantasy_position':p[4],
                'pos_rank':p[5],
                'id':p[6]
            };
            addApiLink( json );
            potentials.push(json);
        });
        render("potentials", {'players':potentials}, "#players");
        setTimeout(updatePotentials, 300);
    }

    , updatePotentials = function() {
        $(".potential tr").not(".head").filter(":visible").each(function(i, ele) {
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
            setTimeout(pickIfActive, 200);
        });
    }

    , pickIfActive = function() {
        var  picks = $('#picks')
        , active = picks.find('.active')
        , my_pick_index = 0
        , position
        ;
        if ( active.length ) {
            picks.find("li").each(function(i, ele) {
                if ( $(ele).is(active) ) {
                    my_pick_index = i;
                }
            });
            if (my_pick_index > 0) {
                position = ROSTER[my_pick_index];
                pick(getTopPlayerId(position));
            }
        }
    }

    , getTopPlayerId = function(pos) {
        var ele = $("#players .free").filter("[data-pos="+pos+"]")[0]
        , id = $(ele).data("id");
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

    , drawRoster = function() {
        var roster_list = []
        ;
        $.each(ROSTER, function(i, s) {
            roster_list.push({'name':s});
        });
        render("roster", {'slots':roster_list}, "#roster");
    }

    , refresh = function() {
        getTeam();
        updatePicks();
        updatePotentials();
    }
    ;

    return {
        init: function() {
            drawRoster();
            drawPotentials();
            refresh();
            setTimeout(refresh, 4000);
            $("#playerSearch").on("click", playerSearch);
        }

        , updatePicked: function() {
            updatePotentials();
        }
    };
}(document, window, undefined);
