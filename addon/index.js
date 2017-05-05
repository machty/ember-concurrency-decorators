import { task as ecTask } from 'ember-concurrency';

function extractValue(desc) {
  return desc.value ||
    (typeof desc.initializer === 'function' && desc.initializer());
}

function isDescriptor(item) {
  return item &&
    typeof item === 'object' &&
    'writable' in item &&
    'enumerable' in item &&
    'configurable' in item;
}

function handleDescriptor(callback, target, key, desc, params = []) {
  return {
    enumerable: desc.enumerable,
    configurable: desc.configurable,
    writeable: desc.writeable,
    initializer: function() {
      if (!desc.writable) {
        throw new Error('ember-concurrency-decorators does not support using getters and setters');
      }

      let value = extractValue(desc);
      return callback(value, params);
    }
  };
}

function decorator(callback) {
  return function(...params) {
    // determine if user called as @task('blah', 'blah') or @task
    if (isDescriptor(params[params.length - 1])) {
      return handleDescriptor(callback, ...arguments);
    } else {
      return function(/* target, key, desc */) {
        return handleDescriptor(callback, ...arguments, params);
      };
    }
  };
}


function taskify(value) {
  return (typeof value === 'function') ? ecTask(value) : value;
}

export const task = decorator(v => taskify(v));
export const restartableTask = decorator(v => taskify(v).restartable());
export const dropTask = decorator(v => taskify(v).drop());
export const keepLatestTask = decorator(v => taskify(v).keepLatest());
export const enqueueTask = decorator(v => taskify(v).enqueue());
