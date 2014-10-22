exports.config =
  conventions:
    assets: /^app\/assets\//
  modules:
    definition: false
    wrapper: false
  paths:
    public: 'deploy'
  files:
    javascripts:
      joinTo:
        'js/vendor.js': /^(bower_components|vendor)/
        'js/app.js': /^(app\/(src|config))|data|config/
      order:
        before: [
          'app/src/config.js'
        ]
    stylesheets:
      joinTo:
        'css/vendor.css': /^(bower_components|vendor)/
        'css/app.css': /^app\/css/
