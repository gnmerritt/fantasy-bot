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

    , call = function( method, callback ) {
        var url = withKey( urlPrefix + method )
        ;
        $.ajax({
            type: "GET",
            url: url,
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            success: callback
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
        render("potentials", {'players':potentials}, "#players");
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

    , refresh = function() {
        drawPotentials();
        getTeam();
        updatePicks();
    }
    ;

    return {
        init: function() {
            refresh();
            setTimeout(refresh, 4000);
            $("#playerSearch").on("click", playerSearch);
        }
    };
}(document, window, undefined);
