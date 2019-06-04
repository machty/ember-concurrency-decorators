'use strict';

const MINIMUM_BABEL_VERSION = '7.7.3';
const PLUGIN_NAME = 'babel-plugin-ember-concurrency-decorators';

module.exports = {
  name: require('./package').name,

  // Based on https://github.com/ember-decorators/ember-decorators/blob/v5.2.0/packages/babel-transforms/index.js
  included(parent) {
    this._super.included.apply(this, arguments);

    // Create parent options, if they do not exist
    const parentOptions = (this.app || this.parent).options || {};

    // Create and extract own options, if they do not exist
    const { enableBabelTransform = true } = parentOptions[this.name] || {};

    if (!enableBabelTransform) return;

    if (!this._registeredWithBabel) {
      const VersionChecker = require('ember-cli-version-checker');
      const checker = new VersionChecker(parent);

      // Fail the build, if `@ember-decorators/babel-transforms` is installed.
      if (checker.for('@ember-decorators/babel-transforms').exists()) {
        let error = `${
          this.name
        }: You have '@ember-decorators/babel-transforms' installed, which brings along unsupported stage 2 decorators Babel transforms. Please uninstall it`;
        if (checker.for('ember-cli-babel').lt(MINIMUM_BABEL_VERSION)) {
          error += ` and upgrade 'ember-cli-babel' to at least v${MINIMUM_BABEL_VERSION}.`;
        } else {
          error += '.';
        }
        throw new Error(error);
      }

      // Fail the build, if the `ember-cli-babel` version is too low.
      if (checker.for('ember-cli-babel').lt(MINIMUM_BABEL_VERSION)) {
        throw new Error(
          `${
            this.name
          }: Please upgrade 'ember-cli-babel' to at least v${MINIMUM_BABEL_VERSION}.`
        );
      }

      const {
        hasPlugin,
        addPlugin
      } = require('ember-cli-babel-plugin-helpers');

      // Add the plugin before the decorators transform.
      if (!hasPlugin(parent, PLUGIN_NAME)) {
        addPlugin(
          parent,
          [
            require.resolve(`./lib/${PLUGIN_NAME}`),
            {
              taskCallExpressionToDecorator: [
                'task',
                'restartableTask',
                'dropTask',
                'keepLatestTask',
                'enqueueTask'
              ],
              taskGroupCallExpressionToDecorator: [
                'taskGroup',
                'restartableTaskGroup',
                'dropTaskGroup',
                'keepLatestTaskGroup',
                'enqueueTaskGroup'
              ],
              addonName: this.name
            }
          ],
          {
            before: [
              '@babel/plugin-proposal-decorators',
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-typescript'
            ]
          }
        );
      }

      this._registeredWithBabel = true;
    }
  }
};
