/**
 * Decorates player objects with a draft API id
 */
(function(document, window, undefined) {
 'use strict';

window.IdMatcher = function(playerEstimates, config) {
    var SEARCH_LIMIT = 100 // searches allowed per minute

    , call = makeCall(config)

    , searchesPastMinute = 0
    , pendingSearches = []

    , runPending = function() {
        var searchFunc;
        while (searchesPastMinute < SEARCH_LIMIT) {
            searchFunc = pendingSearches.pop();
            if ($.isFunction(searchFunc)) {
                searchFunc();
            }
        }
    }

    , search = function( player ) {
        var first_name = player.first_name
        , last_name = player.last_name
        , position = player.pos
        , searchUrl = ["search",
                       "name", encodeURIComponent(last_name),
                       "pos", position].join("/")
        , gotId = function(match) {
            console.log("got id for " + first_name + last_name);
            player.id = match.id;
        }
        , onResults = function(data) {
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
        }
        ;
        return function() {
            searchesPastMinute++;
            call(searchUrl, onResults)
            // after a minute, the API limit has expired so open a slot up
            setTimeout(function() { searchesPastMinute--; }, 60 * 1000);
        };
    }

    , queueSearch = function(player) {
        var searchFunc = search(player)
        pendingSearches.push(searchFunc);
    }
    ;

    // Try to run pending searches
    setInterval(runPending, 1000);

    return {
        match: function() {
            log("Starting player matching");
            $.each(playersByVorp(playerEstimates), function(p) {
                queueSearch(p);
            });
        }

        , search: function() {
            runPending();
        }
    }
};

})(document, window);
