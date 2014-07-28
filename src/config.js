var CONFIG = {};

/**
 * Configuration manager, allows for switching between multiple teams
 */
config = function(document, window, undefined) {

var DEFAULT_CONFIG = "defaultConfig"

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
    dust.render("configs", {"configs": configs}, function(err, out) {
        $("#configs").html(out);
    });
}

, switchConfig = function() {
    $( "select option:selected" ).each(function() {
        var name = $( this ).text();
        localStorage.setItem(DEFAULT_CONFIG, name);
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
        var config = localStorage.getItem(DEFAULT_CONFIG) || "DEBUG";
        fillConfigs(config);
        $("#configs").change(switchConfig);
        loadConfig(config);
    }
};

}(document, window, undefined);
