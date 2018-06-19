import { task as ecTask } from 'ember-concurrency';
import { computedDecoratorWithParams } from '@ember-decorators/utils/computed';
import { assert } from '@ember/debug';

/**
 * This utility function assures compatibility with the Ember object model style
 * and initializer syntax required by Babel 6.
 *
 * For native classes using the method shorthand style (TypeScript & Babel 7),
 * this function will access the `value`. For legacy code it will get the value
 * from the initializer.
 *
 * // Ember object model
 * export default EmberObject.extend({
 *   @task
 *   someTask: function*() {}
 * });
 *
 * // Class syntax with initializers
 * export default class extends EmberObject {
 *   @task
 *   someTask = function*() {}
 * }
 *
 * @param {PropertyDescriptor} desc
 * @returns {object|null}
 */
function extractValue(desc) {
  if ('value' in desc) {
    return desc.value;
  }
  if (typeof desc.initializer === 'function') {
    return desc.initializer();
  }

  return null;
}

/**
 * Takes a `PropertyDescriptor` and turns it into an ember-concurrency
 * `TaskProperty`.
 *
 * @param {PropertyDescriptor} desc
 * @returns {TaskProperty}
 */
function createTaskFromDescriptor(desc) {
  assert(
    'ember-concurrency-decorators: Getters and setters are not supported for tasks.',
    desc.writable
  );

  const value = extractValue(desc);
  assert(
    'ember-concurrency-decorators: Can only decorate a generator function as a task.',
    typeof value === 'function'
  );

  return ecTask(value);
}

const applyOptions = (options, task) =>
  Object.entries(options).reduce((task, [key, value]) => {
    if (value === true) {
      return task[key]();
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return task[key](value);
    }
    assert(
      `ember-concurrency-decorators: Cannot apply option '${key}' of type ${typeof value} with value '${value}' to task. Either specify the option as 'true' or provide a numeric or string value.`
    );
    return task;
  }, task);

const createTaskDecorator = (baseOptions = {}) =>
  computedDecoratorWithParams((target, key, desc, [userOptions]) =>
    applyOptions(
      Object.assign({}, baseOptions, userOptions),
      createTaskFromDescriptor(desc)
    )
  );

export const task = createTaskDecorator();
export const restartableTask = createTaskDecorator({ restartable: true });
export const dropTask = createTaskDecorator({ drop: true });
export const keepLatestTask = createTaskDecorator({ keepLatest: true });
export const enqueueTask = createTaskDecorator({ enqueue: true });
