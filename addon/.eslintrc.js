/* eslint-env node */
module.exports = {
  root: true,
  extends: '@clark/ember-typescript',
  rules: {
    // Disabled to allow direct mutation of descriptors passed to decorators
    'no-param-reassign': 'off',

    // Disabled, because we need to do a lot of black magic around decorators 😭
    '@typescript-eslint/ban-ts-ignore': 'warn'
  }
};
