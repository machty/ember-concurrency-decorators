'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
const Funnel = require('broccoli-funnel');

class EmberConcurrencyDecoratorsAddon extends EmberAddon {
  getTests() {
    const exclude = this.options.legacyDecorators
      ? ['**/*-stage-2-test.js']
      : ['**/*-legacy-test.js'];

    return new Funnel(super.getTests(), { exclude });
  }
}

module.exports = function(defaults) {
  let app = new EmberConcurrencyDecoratorsAddon(defaults, {
    legacyDecorators: Boolean(process.env.LEGACY_DECORATORS)
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  return app.toTree();
};
