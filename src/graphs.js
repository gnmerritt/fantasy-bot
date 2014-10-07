(function(document, window, undefined) {
 'use strict';

/**
 * Module to graph live player data
 * Uses Flot.js to power the graphs
 */
window.Graphs = function(inputData) {
    var FUNCS = {
        "points": function(i, p) { return p.points; }
        , "vorp": function(i, p) { return p.vorp; }
    }

    , playerEstimates = inputData // reference to main bot data

    , nextRedraw = null // next scheduled redraw
    ;

    // Flot hack - Makes the max value on an axis a label instead of the number
    function axisHack(name) {
        return function(val, axis) {
            return val < axis.max ? val.toFixed(2) : name;
        };
    };

    function getDerivative(i, player, dataFunc) {
      var prevIndex = i - 1
        , prevPlayer = playerEstimates[player.pos][prevIndex]
        ;
        if (prevPlayer) {
            return dataFunc(i, prevPlayer) - dataFunc(i, player);
        }
    };

    /**
     * Given a list of player objects, return a tuple for use by flot
     */
    function getPositionData(positionEstimates, type) {
        var players = []
        , dataFunc = FUNCS[type]
        ;
        if ($("input.deriv").prop('checked')) {
            var originalFunc = dataFunc;
            dataFunc = function(i, p) {
                return getDerivative(i, p, originalFunc);
            };
        }
        $.each(positionEstimates, function(i, p) {
            players.push([i + 1, dataFunc(i, p)]);
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

    function queueRedraw() {
        if (!nextRedraw) {
            nextRedraw = setTimeout(function() {
                redrawActive();
                nextRedraw = null;
            }, 2000);
        }
    }

    function attachListeners() {
        $(window).on(window.ff.UPDATE, queueRedraw);
        $("input.deriv").on("click", redrawActive);
        $(".graph button").on("click", function() {
            drawGraph($(this).data("type"));
        });
    };

    attachListeners();
    redrawActive();
};

})(document, window);
