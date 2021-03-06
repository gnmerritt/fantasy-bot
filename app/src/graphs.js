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
        , "vopos": function(p) { return p.vopos; }
    }

    , MODS = {
        "x": function(p, i, base) { return base(p, i); }
        , "fx": getDerivative
        , "ffx": function(p, i, base) {
            var firstDeriv = function(p2, i2) {
                return getDerivative(p2, i2, base);
            };
            return getDerivative(p, i, firstDeriv);
        }
    }

    , playerEstimates = inputData // reference to main bot data

    , nextRedraw = null // next scheduled redraw
    ;

    function getDerivative(player, i, dataFunc) {
      var prevIndex = i - 1
        , prevPlayer = playerEstimates[player.pos][prevIndex]
        ;
        if (prevPlayer) {
            return dataFunc(player, i) - dataFunc(prevPlayer, prevIndex);
        }
    }

    /**
     * Given a list of player objects, return a tuple for use by flot
     */
    function getPositionData(positionEstimates, type) {
        var players = []
        , dataFunc = FUNCS[type]
        , mod = $(".deriv .active").data("mod") || "x"
        , modFunc = MODS[mod]
        ;
        $.each(positionEstimates, function(i, p) {
            players.push([i + 1, modFunc(p, i, dataFunc)]);
        });
        return players;
    }

    // Flot hack - Makes the max value on an axis a label instead of the number
    function axisHack(name) {
        return function(val, axis) {
            return val < axis.max ? val.toFixed(2) : name;
        };
    }

    function drawGraph(type) {
        var graphData = []
        , plot
        ;
        $.each(playerEstimates, function(i, positionList) {
            var rawData = getPositionData(positionList, type);
            graphData.push({
                label:i
                , data:rawData
            });
        });
        plot = $.plot("#pos_graph", graphData, {
            yaxis: {
                tickFormatter: axisHack(type)
                , zoomRange: [null, 500]
            }
            , xaxis: {
                zoomRange: [5, 225]
                , panRange: [0, 225]
            }
            , grid: { hoverable: true }
            , zoom: { interactive: true }
            , pan: { interactive: true }
        });

        $("<button id='zoomOut' class='btn'>Zoom out</button>")
            .appendTo($("#pos_graph"))
            .click(function (event) {
                event.preventDefault();
                plot.zoomOut();
            });

        _attachListeners();
    }

    function _attachListeners() {
        $("#pos_graph").bind("plothover", function(event, pos, item) {
            var tooltip = $("#graphPopup")
            , offset = 30
            ;
            if (item) {
                var playerIndex = item.dataIndex
                , position = item.series.label
                , player = playerEstimates[position][playerIndex]
                , data = $.extend({}, player, {
                    value: item.datapoint[1].toFixed(2)
                })
                , css = {
                    top: item.pageY - offset
                    , left: item.pageX + offset
                    , borderColor: item.series.color
                }
                ;
                render("playerPopup", data, "#graphPopup", function() {
                    tooltip.css(css).fadeIn(200);
                });
            }
            else {
                tooltip.hide();
            }
        });
    }

    function redrawActive() {
        var activeType = $(".graph button.active").data("type");
        drawGraph(activeType);
    }

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
        $(".deriv button, .graph button").on("click", function() {
            setTimeout(redrawActive, 1);
        });
    }

    attachListeners();
    redrawActive();
};

})(document, window);
