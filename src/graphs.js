(function(document, window, undefined) {
 'use strict';

window.graphs = (function() {

    function getPositionData(positionEstimates) {
        var players = [];
        $.each(positionEstimates, function(i, p) {
            players.push([i + 1, p.points]);
        });
        return players;
    };

    function update(playerEstimates) {
        var graphData = []
        ;
        $.each(playerEstimates, function(i, p) {
            var rawData = getPositionData(p);
            graphData.push({
                label:i
                , data:rawData
            });
        });
        $.plot("#pos_graph", graphData, {});
    };

    return {
        update: update

        , init: function() {
            $(window).on(window.ff.UPDATE, update);
        }
    };
})();

})(document, window);
