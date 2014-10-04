(function(document, window, undefined) {
 'use strict';

/**
 * Module to graph live player data
 * Uses Flot.js to power the graphs
 */
window.Graphs = function(inputData) {
    var FUNCS = {
        "points": function(p) { return p.points; }
        , "vorp": function(p) { return p.vorp; }
        // TODO: derivative(points) ?
    }

    , playerEstimates = inputData
    ;

    // Flot hack - Makes the max value on an axis a label instead of the number
    function axisHack(name) {
        return function(val, axis) {
            return val < axis.max ? val.toFixed(2) : name;
        };
    };

    /**
     * Given a list of player objects, return a tuple for use by flot
     */
    function getPositionData(positionEstimates, type) {
        var players = []
        , dataFunc = FUNCS[type]
        ;
        $.each(positionEstimates, function(i, p) {
            players.push([i + 1, dataFunc(p)]);
        });
        return players;
    };

    function drawGraph(type) {
        var graphData = []
        ;
        $.each(playerEstimates, function(i, positionList) {
            var rawData = getPositionData(positionList, type);
            graphData.push({
                label:i
                , data:rawData
            });
        });
        $.plot("#pos_graph", graphData, {
            yaxis: { tickFormatter: axisHack(type) }
        });
    };

    function redrawActive() {
        var activeType = $(".graph button.active").data("type");
        drawGraph(activeType);
    };

    function attachListeners() {
        $(window).on(window.ff.UPDATE, redrawActive);
        $(".graph button").on("click", function() {
            drawGraph($(this).data("type"));
        });
    };

    attachListeners();
    redrawActive();
};

})(document, window);
