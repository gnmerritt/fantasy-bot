/**
 * Configuration manager, allows for switching between multiple teams
 */
config = function(document, window, undefined) {
 'use strict';

var LAST_CONFIG = "defaultConfig"

, fillConfigs = function(selected) {
    var holder = $("#configs")
    , configs = []
    ;
    $.each(CONFIG, function(name, data) {
        data.name = name;
        if (name == selected) {
            data.selected = true;
        }
        configs.push(data);
    });
    render("configs", {"configs": configs}, "#configs");
}

, switchConfig = function() {
    $( "select option:selected" ).each(function() {
        var name = $( this ).text();
        localStorage.setItem(LAST_CONFIG, name);
        log("reloading with new config", name);
        window.location.reload();
    });
}

, loadConfig = function(name) {
    window.ff = new FantasyDrafter(CONFIG[name]);
    window.ff.init();
}

;

return {
    init: function() {
        var config = localStorage.getItem(LAST_CONFIG) || "YAHOO";
        fillConfigs(config);
        $("#configs").change(switchConfig);
        loadConfig(config);
    }
};

}(document, window);
