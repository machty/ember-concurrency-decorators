/* eslint-env node */
module.exports = {
  root: true,
  extends: '@clark/ember-typescript',
  rules: {
    // Disabled, because we need to do a lot of black magic around decorators 😭
    '@typescript-eslint/ban-ts-ignore': 'warn'
  }
};
