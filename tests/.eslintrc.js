/* eslint-env node */

module.exports = {
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  rules: {
    'ember/avoid-leaking-state-in-ember-objects': 'off'
  }
};
