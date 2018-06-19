import {
  task as createTaskProperty,
  taskGroup as createTaskGroupProperty
} from 'ember-concurrency';
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
 * @private
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
 * @private
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

  return createTaskProperty(value);
}

/**
 * Takes a `PropertyDescriptor` and turns it into an ember-concurrency
 * `TaskGroupProperty`.
 *
 * @param {PropertyDescriptor} desc
 * @returns {TaskGroupProperty}
 * @private
 */
function createTaskGroupFromDescriptor(desc) {
  assert(
    'ember-concurrency-decorators: Getters and setters are not supported for task groups.',
    desc.writable
  );
  assert(
    'ember-concurrency-decorators: Task groups can not accept values.',
    !extractValue(desc)
  );
  return createTaskGroupProperty();
}

/**
 * Applies the `options` provided using the chaining API on the given `task`.
 *
 * @param {object} options
 * @param {TaskProperty|TaskGroupProperty} task
 * @private
 */
const applyOptions = (options, task) =>
  Object.entries(options).reduce((task, [key, value]) => {
    if (value === true) {
      return task[key]();
    }
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      Array.isArray(value)
    ) {
      return task[key](value);
    }
    assert(
      `ember-concurrency-decorators: Cannot apply option '${key}' of type ${typeof value} with value '${value}' to task. Either specify the option as 'true' or provide a numeric or string value.`
    );
    return task;
  }, task);

/**
 * Creates a decorator function that transforms the decorated property using the
 * given `propertyCreator` and accepts an optional user provided options hash,
 * that that will be merged with the `baseOptions`.
 *
 * @param {function} propertyCreator
 * @param {object} [baseOptions={}]
 * @private
 */
const createDecorator = (propertyCreator, baseOptions = {}) =>
  computedDecoratorWithParams((target, key, desc, [userOptions]) =>
    applyOptions(
      Object.assign({}, baseOptions, userOptions),
      propertyCreator(desc)
    )
  );

/**
 * Turns the decorated generator function into a task.
 *
 * Optionally takes a hash of options that will be applied as modifiers to the
 * task. For instance `maxConcurrency`, `on`, `group` or `keepLatest`.
 *
 * ```js
 * import EmberObject from '@ember/object';
 * import { task } from 'ember-concurrency-decorators';
 *
 * class extends EmberObject {
 *   @task
 *   *plainTask() {}
 *
 *   @task({ maxConcurrency: 5, keepLatest: true, cancelOn: 'click' })
 *   *taskWithModifiers() {}
 * }
 * ```
 *
 * @function
 * @param {object?} [options={}]
 * @return {TaskProperty}
 */
export const task = createDecorator(createTaskFromDescriptor);

/**
 * Turns the decorated generator function into a task and applies the
 * `restartable` modifier.
 *
 * Optionally takes a hash of further options that will be applied as modifiers
 * to the task.
 *
 * @function
 * @param {object?} [options={}]
 * @return {TaskProperty}
 */
export const restartableTask = createDecorator(createTaskFromDescriptor, {
  restartable: true
});

/**
 * Turns the decorated generator function into a task and applies the
 * `drop` modifier.
 *
 * Optionally takes a hash of further options that will be applied as modifiers
 * to the task.
 *
 * @function
 * @param {object?} [options={}]
 * @return {TaskProperty}
 */
export const dropTask = createDecorator(createTaskFromDescriptor, {
  drop: true
});

/**
 * Turns the decorated generator function into a task and applies the
 * `keepLatest` modifier.
 *
 * Optionally takes a hash of further options that will be applied as modifiers
 * to the task.
 *
 * @function
 * @param {object?} [options={}]
 * @return {TaskProperty}
 */
export const keepLatestTask = createDecorator(createTaskFromDescriptor, {
  keepLatest: true
});

/**
 * Turns the decorated generator function into a task and applies the
 * `enqueue` modifier.
 *
 * Optionally takes a hash of further options that will be applied as modifiers
 * to the task.
 *
 * @function
 * @param {object?} [options={}]
 * @return {TaskProperty}
 */
export const enqueueTask = createDecorator(createTaskFromDescriptor, {
  enqueue: true
});

/**
 * Turns the decorated property into a task group.
 *
 * Optionally takes a hash of options that will be applied as modifiers to the
 * task group. For instance `maxConcurrency` or `keepLatest`.
 *
 * ```js
 * import EmberObject from '@ember/object';
 * import { task taskGroup } from 'ember-concurrency-decorators';
 *
 * class extends EmberObject {
 *   @taskGroup({ maxConcurrency: 5 }) someTaskGroup;
 *
 *   @task({ group: 'someTaskGroup' })
 *   *someTask() {}
 *
 *   @task({ group: 'someTaskGroup' })
 *   *anotherTask() {}
 * }
 * ```
 *
 * @function
 * @param {object?} [options={}]
 * @return {TaskGroupProperty}
 */
export const taskGroup = createDecorator(createTaskGroupFromDescriptor);

/**
 * Turns the decorated property into a task group and applies the
 * `restartable` modifier.
 *
 * Optionally takes a hash of further options that will be applied as modifiers
 * to the task group.
 *
 * @function
 * @param {object?} [options={}]
 * @return {TaskGroupProperty}
 */
export const restartableTaskGroup = createDecorator(
  createTaskGroupFromDescriptor,
  {
    restartable: true
  }
);

/**
 * Turns the decorated property into a task group and applies the
 * `drop` modifier.
 *
 * Optionally takes a hash of further options that will be applied as modifiers
 * to the task group.
 *
 * @function
 * @param {object?} [options={}]
 * @return {TaskGroupProperty}
 */
export const dropTaskGroup = createDecorator(createTaskGroupFromDescriptor, {
  drop: true
});

/**
 * Turns the decorated property into a task group and applies the
 * `keepLatest` modifier.
 *
 * Optionally takes a hash of further options that will be applied as modifiers
 * to the task group.
 *
 * @function
 * @param {object?} [options={}]
 * @return {TaskGroupProperty}
 */
export const keepLatestTaskGroup = createDecorator(
  createTaskGroupFromDescriptor,
  {
    keepLatest: true
  }
);

/**
 * Turns the decorated property into a task group and applies the
 * `enqueue` modifier.
 *
 * Optionally takes a hash of further options that will be applied as modifiers
 * to the task group.
 *
 * @function
 * @param {object?} [options={}]
 * @return {TaskGroupProperty}
 */
export const enqueueTaskGroup = createDecorator(createTaskGroupFromDescriptor, {
  enqueue: true
});
