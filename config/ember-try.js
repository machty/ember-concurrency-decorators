'use strict';

const getChannelURL = require('ember-source-channel-url');
const flatMap = require('lodash.flatmap');
const merge = require('lodash.merge');

const withDecoratorVariants = scenarios =>
  flatMap(scenarios, scenario => [
    scenario,
    merge({}, scenario, {
      name: `${scenario.name}-legacy-decorators`,
      env: {
        LEGACY_DECORATORS: true
      },
      npm: {
        dependencies: {
          '@ember-decorators/babel-transforms': '^2.1.2',
          'ember-cli-typescript': null
        },
        devDependencies: {
          'ember-cli-typescript': '^1.5.0'
        }
      }
    })
  ]);

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then(urls => {
    return {
      scenarios: withDecoratorVariants([
        {
          name: 'ember-lts-2.12',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              'jquery-integration': true
            })
          },
          npm: {
            devDependencies: {
              '@ember/jquery': '^0.5.1',
              'ember-source': '~2.12.0'
            }
          }
        },
        {
          name: 'ember-lts-2.16',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              'jquery-integration': true
            })
          },
          npm: {
            devDependencies: {
              '@ember/jquery': '^0.5.1',
              'ember-source': '~2.16.0'
            }
          }
        },
        {
          name: 'ember-lts-2.18',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              'jquery-integration': true
            })
          },
          npm: {
            devDependencies: {
              '@ember/jquery': '^0.5.1',
              'ember-source': '~2.18.0'
            }
          }
        },
        {
          name: 'ember-release',
          npm: {
            devDependencies: {
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-beta',
          npm: {
            devDependencies: {
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-canary',
          npm: {
            devDependencies: {
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-default',
          npm: {
            devDependencies: {}
          }
        }
      ])
    };
  });
};
