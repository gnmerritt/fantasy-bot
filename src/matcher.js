/**
 * Decorates player objects with a draft API id, returns a map
 * of player id -> player object
 */
(function(document, window, undefined) {
 'use strict';

window.IdMatcher = function(playerEstimates, config) {
    var SEARCH_LIMIT = 150 // searches allowed per minute

    , call = makeCall(config)

    , searchesPastMinute = 0
    , pendingSearches = []
    , searchRunnerInterval

    , idsToPlayers = {}

    , runPending = function() {
        for (var ranNow = 0;
             pendingSearches && searchesPastMinute < SEARCH_LIMIT && ranNow < 30;
             ranNow++) {
            var searchFunc = pendingSearches.shift();
            if ($.isFunction(searchFunc)) {
                searchFunc();
            }
        }
        if (!pendingSearches) {
            log("Finished matching players");
            clearInterval(searchRunnerInterval);
        }
    }

    , search = function( player ) {
        var searchUrl = ["search",
                       "name", escape(player.last_name),
                       "pos", player.pos].join("/")
        , gotId = function(match) {
            player.id = match.id;
            idsToPlayers[player.id] = player;
            $(window).trigger(window.ff.UPDATE);
        }
        , onResults = function(data) {
            // Only got one match back, trust it
            if ( data.results && data.results.length == 1 ) {
                gotId(data.results[0]);
            }
            else if ( data.results ) { // Look a little harder
                $.each(data.results, function(i, result) {
                    var resultName = result.first_name.toLowerCase()
                    if ( resultName.indexOf(player.first_name.toLowerCase()) > -1 ) {
                        gotId(result);
                        return;
                    }
                });
            }
        }
        ;
        return function() {
            searchesPastMinute++;
            call(searchUrl, onResults);
            // after a minute, the API limit has expired so open a slot up
            setTimeout(function() { searchesPastMinute--; }, 60 * 1000);
        };
    }

    , queueSearch = function(player) {
        var searchFunc = search(player);
        pendingSearches.push(searchFunc);
    }
    ;

    return {
        match: function() {
            log("Starting player matching");
            $.each(playersByVorp(playerEstimates), function(i, p) {
                queueSearch(p);
            });
            // Try to run pending searches
            searchRunnerInterval = setInterval(runPending, 5 * 1000);
            runPending();
            return idsToPlayers;
        }
    }
};

})(document, window);
