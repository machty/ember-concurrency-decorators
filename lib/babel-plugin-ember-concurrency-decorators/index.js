'use strict';

const { dirname } = require('path');

function macros(babel) {
  const { types: t } = babel;

  function ClassProperty(path, state) {
    const {
      taskCallExpressionToDecorator,
      taskGroupCallExpressionToDecorator,
      addonName
    } = state.opts;

    const value = path.get('value');
    if (!value.isCallExpression()) return;

    const { callee } = value.node;

    if (callee.type !== 'Identifier') return;

    const binding = value.scope.getBinding(callee.name);
    if (!binding) return;

    if (
      !binding ||
      !binding.path.isImportSpecifier() ||
      binding.path.parent.source.value !== addonName ||
      (!taskCallExpressionToDecorator.includes(
        binding.path.node.imported.name
      ) &&
        !taskGroupCallExpressionToDecorator.includes(
          binding.path.node.imported.name
        ))
    )
      return;

    value.replaceWith(value.node.arguments[0]);

    if (!path.node.decorators) path.node.decorators = [];
    path.node.decorators.push(t.decorator(callee));
  }

  return {
    name: 'babel-plugin-ember-concurrency-decorators',
    visitor: {
      Class(path, state) {
        const body = path.get('body');

        for (const path of body.get('body')) {
          if (!path.isClassProperty()) continue;
          ClassProperty(path, state);
        }
      }
    }
  };
}

macros.baseDir = function() {
  return dirname(__dirname);
};

module.exports = macros;
