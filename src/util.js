/**
 * Shared utility stuff
 */

/**
 * Full version of `log` that:
 *   - Prevents errors on console methods when no console present.
 *   - Exposes a global 'log' function that preserves line numbering and formatting.
 * credit: http://www.briangrinstead.com/blog/console-log-helper-function
 */
(function () {
    var method
    , noop = function () { }
    , methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ]
    , length = methods.length
    , console = (window.console = window.console || {})
    ;

    while (length--) {
        method = methods[length];
        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }

    if (Function.prototype.bind) {
        window.log = Function.prototype.bind.call(console.log, console);
    }
    else {
        window.log = function() {
            Function.prototype.apply.call(console.log, console, arguments);
        };
    }
})();

/**
 * Call the action function for every player on the input map
 *  {position -> [players], ...}
 */
window.forEveryPlayer = function(input, action) {
    $.each(input, function(pos, playerList) {
        $.each(playerList, function(i, player) {
            action(player, i);
        });
    });
}

/**
 * Given a dict of players by postion, get back a single sorted list
 */
window.playersByVorp = function(inputPlayers) {
    var players = [];
    forEveryPlayer(inputPlayers, function(p) {
        players.push(p);
    });
    players.sort(function(a,b) { return b.vorp - a.vorp; });
    return players;
}

window.averagePoints = function(players) {
    var total = 0;
    $.each(players, function(_, player) {
        total += player.points;
    });
    return total / Math.max(players.length, 1);
}

/**
 * Thin wrapper around dust.render - should be the only place dust is referenced
 */
window.render = (function() {
    var base = dust.makeBase({});

    return function(name, data, selector, callback) {
        dust.render(name, base.push(data), function(err, out) {
            $(selector).html(out);
            if ($.isFunction(callback)) {
                callback();
            }
        });
    }
})();

/**
 * Function generator that returns an config specific call function
 */
window.makeCall = function(config) {
    var urlPrefix = ["http://", config.HOST, config.PREFIX].join("")
    , withKey = function( url ) {
        return url + "?key=" + config.KEY;
    }
    ;
    return function( method, callback, type ) {
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
};

window.now_utc = function() {
    return Math.floor((new Date()).getTime() / 1000);
};

/**
 * Copies & cleans up the input data - converts all numeric fields to floats
 */
window.cleanInputData = function(jsonInput) {
    var input = JSON.parse(JSON.stringify(jsonInput)) // :-P
    , strsToFloats = function(player) {
        var vals = {};
        $.each(player, function(key, value) {
            try {
                var asFloat = parseFloat(value);
                if ($.isNumeric(asFloat)) {
                    vals[key] = asFloat;
                }
            }
            catch (e) {}
        });
        $.extend(player, vals);
    }
    ;
    forEveryPlayer(input, strsToFloats);
    return input;
};
