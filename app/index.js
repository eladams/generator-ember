'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

var EmberGenerator = module.exports = function EmberGenerator(args, options) {
  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';

  // for hooks to resolve on mocha by default
  if (!options['test-framework']) {
    options['test-framework'] = 'mocha';
  }

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', { as: 'app' });

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });
};

util.inherits(EmberGenerator, yeoman.generators.Base);

EmberGenerator.prototype.welcome = function welcome() {
  // welcome message
  var welcomeMsg =
  '\n     _-----_' +
  '\n    |       |' +
  '\n    |' + '--(o)--'.red + '|   .--------------------------.' +
  '\n   `---------´  |    ' + 'Welcome to Yeoman,'.yellow.bold + '    |' +
  '\n    ' + '( '.yellow + '_' + '´U`'.yellow + '_' + ' )'.yellow + '   |   ' + 'ladies and gentlemen!'.yellow.bold + '  |' +
  '\n    /___A___\\   \'__________________________\'' +
  '\n     |  ~  |'.yellow +
  '\n   __' + '\'.___.\''.yellow + '__' +
  '\n ´   ' + '`  |'.red + '° ' + '´ Y'.red + ' `\n';

  console.log(welcomeMsg);
};

EmberGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  var prompts = [{
    name: 'compassBootstrap',
    message: 'Would you like to include Twitter Bootstrap for Sass?',
    default: 'Y/n'
  }];

  this.prompt(prompts, function (err, props) {
    if (err) {
      return this.emit('error', err);
    }

    this.compassBootstrap = (/y/i).test(props.compassBootstrap);
    cb();
  }.bind(this));

};

EmberGenerator.prototype.createDirLayout = function createDirLayout() {
  this.mkdir('app/templates');
  this.mkdir('app/styles');
  this.mkdir('app/images');
  this.mkdir('app/scripts');
  this.mkdir('app/scripts/models');
  this.mkdir('app/scripts/controllers');
  this.mkdir('app/scripts/routes');
  this.mkdir('app/scripts/views');
};

EmberGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

EmberGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_component.json', 'component.json');
};

EmberGenerator.prototype.packageFile = function packageFile() {
  this.copy('_package.json', 'package.json');
};

EmberGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

EmberGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

EmberGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

EmberGenerator.prototype.templates = function templates() {
  this.copy('hbs/application.hbs', 'app/templates/application.hbs');
  this.copy('hbs/index.hbs', 'app/templates/index.hbs');
};

EmberGenerator.prototype.writeIndex = function writeIndex() {
  var mainCssFiles = [];
  if (this.compassBootstrap) {
    mainCssFiles.push('styles/style.css');
  } else {
    mainCssFiles.push('styles/normalize.css');
    mainCssFiles.push('styles/style.css');
  }

  this.indexFile = this.appendStyles(this.indexFile, 'styles/main.css', mainCssFiles);

  this.indexFile = this.appendScripts(this.indexFile, 'scripts/components.js', [
    'components/jquery/jquery.js',
    'components/handlebars/handlebars.runtime.js',
    'components/ember/ember.js'
  ]);

  this.indexFile = this.appendFiles(this.indexFile, 'js', 'scripts/main.js', [
    'scripts/app.js',
    'scripts/compiled-templates.js'
  ], null, ['app', '.tmp']);
};

EmberGenerator.prototype.bootstrapJavaScript = function bootstrapJavaScript() {
  if (!this.compassBootstrap) {
    return;  // Skip if disabled.
  }

  // Wire Twitter Bootstrap plugins
  this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
    'components/bootstrap-sass/js/bootstrap-affix.js',
    'components/bootstrap-sass/js/bootstrap-alert.js',
    'components/bootstrap-sass/js/bootstrap-dropdown.js',
    'components/bootstrap-sass/js/bootstrap-tooltip.js',
    'components/bootstrap-sass/js/bootstrap-modal.js',
    'components/bootstrap-sass/js/bootstrap-transition.js',
    'components/bootstrap-sass/js/bootstrap-button.js',
    'components/bootstrap-sass/js/bootstrap-popover.js',
    'components/bootstrap-sass/js/bootstrap-typeahead.js',
    'components/bootstrap-sass/js/bootstrap-carousel.js',
    'components/bootstrap-sass/js/bootstrap-scrollspy.js',
    'components/bootstrap-sass/js/bootstrap-collapse.js',
    'components/bootstrap-sass/js/bootstrap-tab.js'
  ]);
};

EmberGenerator.prototype.all = function all() {
  this.write('app/index.html', this.indexFile);

  if (this.compassBootstrap) {
    this.copy('styles/style_bootstrap.scss', 'app/styles/style.scss');
  } else {
    this.copy('styles/normalize.css', 'app/styles/normalize.css');
    this.copy('styles/style.css', 'app/styles/style.css');
  }

  this.copy('scripts/app.js', 'app/scripts/app.js');
};
