/**
 * Decorates player objects with a draft API id
 */
(function(document, window, undefined) {
 'use strict';

window.IdMatcher = function(playerEstimates, config) {
    var SEARCH_LIMIT = 60 // searches allowed per minute

    , call = makeCall(config)

    , searchesPastMinute = 0
    , pendingSearches = []

    , runPending = function() {
        var searchFunc
        , ranNow = 0
        ;
        while (searchesPastMinute < SEARCH_LIMIT) {
            // arbitrary throttling
            if (ranNow > 30) {
                return;
            }
            searchFunc = pendingSearches.shift();
            if ($.isFunction(searchFunc)) {
                searchFunc();
                ranNow++;
            }
        }
    }

    , search = function( player ) {
        var searchUrl = ["search",
                       "name", escape(player.last_name),
                       "pos", player.pos].join("/")
        , gotId = function(match) {
            player.id = match.id;
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

    // Try to run pending searches
    setInterval(runPending, 1000);

    return {
        match: function() {
            log("Starting player matching");
            $.each(playersByVorp(playerEstimates), function(i, p) {
                queueSearch(p);
            });
        }
    }
};

})(document, window);
