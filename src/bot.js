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

    , withKey = function( url ) {
        return url + "?key=" + KEY;
    }

    , jsonP = function( url ) {
        return url + "&callback=cb";
    }

    , call = function( method, callback ) {
        var url = jsonP( withKey( urlPrefix + method ) )
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
        }
    };
}(document, window, undefined);
