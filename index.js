'use strict';

module.exports = {
  name: require('./package').name,
  options: {
    babel: {
      plugins: [require.resolve('@babel/plugin-proposal-object-rest-spread')]
    }
  }
};
