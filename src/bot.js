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
        return url + "?key=" + KEY + "&callback=cb";
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

    , _updatePicks = function() {
        call("picks", function(data) {
            var myTeam = function(ele) {
                return ele.team.id == teamId;
            }
            , mine = data.picks.filter(myTeam)
            ;
            render("pickList", {'mine':mine}, "#picks");
        });
    }

    , _getTeam = function() {
        call("team", function(data) {
            render("team", data, "#team");
            teamId = data.id;
        });
    }
    ;

    return {
        init: function() {
            _getTeam();
            _updatePicks();
        }

    };
}(document, window, undefined);
