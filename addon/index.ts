import {
  decoratorWithParams,
  DecoratorDescriptor
} from '@ember-decorators/utils/decorator';
import { assert } from '@ember/debug';

import {
  task as createTaskProperty,
  taskGroup as createTaskGroupProperty,
  TaskFunction as GenericTaskFunction,
  TaskProperty as GenericTaskProperty,
  TaskGroupProperty as GenericTaskGroupProperty,
  EncapsulatedTaskDescriptor as GenericEncapsulatedTask
} from 'ember-concurrency';

export { default as lastValue } from './last-value';

type TaskFunction = GenericTaskFunction<unknown, unknown[]>;
type TaskProperty = GenericTaskProperty<unknown, unknown[]>;
type TaskGroupProperty = GenericTaskGroupProperty<unknown>;
type EncapsulatedTask = GenericEncapsulatedTask<unknown, unknown[]>;

type OptionsFor<T extends object> = {
  [K in OptionKeysFor<T>]?: OptionTypeFor<T, T[K]>;
};

type OptionKeysFor<T extends object> = {
  [K in keyof T]: OptionKeyFor<T, K, T[K]>;
}[keyof T];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OptionKeyFor<T, K, F> = F extends (...args: any[]) => T ? K : never;

type OptionTypeFor<T, F> = F extends (...args: infer Args) => T
  ? Args[0] extends undefined
    ? true
    : Args[1] extends undefined
    ? Args[0]
    : Args[0] | Array<Args[0]>
  : never;

type TaskOptions = OptionsFor<TaskProperty>;

type TaskGroupOptions = OptionsFor<TaskGroupProperty>;

type Decorator = (
  ...args: Parameters<MethodDecorator>
) => Exclude<ReturnType<MethodDecorator>, void>;

type ObjectValues<O> = O extends { [s: string]: infer V } ? V : never;

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
 * @param desc
 * @returns {object|null}
 * @private
 */
function extractValue(desc: DecoratorDescriptor): unknown {
  if (typeof desc.initializer === 'function') {
    return desc.initializer.call(undefined);
  }

  if (typeof desc.get === 'function') {
    return desc.get.call(undefined);
  }

  if (desc.value) {
    return desc.value;
  }

  return undefined;
}

function isTaskFunction(value: unknown): value is TaskFunction {
  return typeof value === 'function';
}

function isEncapsulatedTask(value: unknown): value is EncapsulatedTask {
  return (
    typeof value === 'object' &&
    value !== null &&
    isTaskFunction((value as { perform?: unknown }).perform)
  );
}

/**
 * Takes a `PropertyDescriptor` and turns it into an ember-concurrency
 * `TaskProperty`.
 *
 * @param desc
 * @returns {TaskProperty}
 * @private
 */
function createTaskFromDescriptor(desc: DecoratorDescriptor): TaskProperty {
  const value = extractValue(desc);

  if (isTaskFunction(value)) {
    return createTaskProperty(value);
  }

  if (isEncapsulatedTask(value)) {
    return createTaskProperty(value);
  }

  assert(
    'ember-concurrency-decorators: Can only decorate a generator function as a task or an object with a generator method `perform` as an encapsulated task.'
  );
}

/**
 * Takes a `PropertyDescriptor` and turns it into an ember-concurrency
 * `TaskGroupProperty`.
 *
 * @param desc
 * @returns {TaskGroupProperty}
 * @private
 */
function createTaskGroupFromDescriptor(
  _desc: DecoratorDescriptor
): TaskGroupProperty {
  return createTaskGroupProperty();
}

/**
 * Applies the `options` provided using the chaining API on the given `task`.
 *
 * @param options
 * @param {TaskProperty|TaskGroupProperty} task
 * @private
 */
function applyOptions(
  options: TaskGroupOptions,
  task: TaskGroupProperty
): TaskGroupProperty & Decorator;
function applyOptions(
  options: TaskOptions,
  task: TaskProperty
): TaskProperty & Decorator;
function applyOptions(
  options: TaskGroupOptions | TaskOptions,
  task: TaskGroupProperty | TaskProperty
): (TaskGroupProperty | TaskProperty) & Decorator {
  return Object.entries(options).reduce(
    (
      taskProperty,
      [key, value]: [
        keyof typeof options,
        ObjectValues<Required<typeof options>>
      ]
    ) => {
      assert(
        `ember-concurrency-decorators: Option '${key}' is not a valid function`,
        typeof taskProperty[key] === 'function'
      );
      if (value === true) {
        return (taskProperty[key] as () => typeof taskProperty)();
      }
      if (Array.isArray(value)) {
        type O = typeof value[0];
        return (taskProperty[key] as (...o: O[]) => typeof taskProperty)(
          ...value
        );
      }
      return (taskProperty[key] as (o: typeof value) => typeof taskProperty)(
        value
      );
    },
    task
    // The CP decorator gets executed in `createDecorator`
  ) as typeof task & Decorator;
}

type MethodOrPropertyDecoratorWithParams<
  Params extends unknown[]
> = MethodDecorator &
  PropertyDecorator &
  ((...params: Params) => MethodDecorator & PropertyDecorator);

/**
 * Creates a decorator function that transforms the decorated property using the
 * given `propertyCreator` and accepts an optional user provided options hash,
 * that that will be merged with the `baseOptions`.
 *
 * @param {function} propertyCreator
 * @param {object} [baseOptions={}]
 * @private
 */
function createDecorator(
  propertyCreator: (desc: DecoratorDescriptor) => TaskProperty,
  baseOptions?: TaskOptions
): MethodOrPropertyDecoratorWithParams<[TaskOptions]>;
function createDecorator<Params extends unknown[]>(
  propertyCreator: (desc: DecoratorDescriptor) => TaskGroupProperty,
  baseOptions?: TaskGroupOptions
): MethodOrPropertyDecoratorWithParams<[TaskGroupOptions]>;
function createDecorator(
  propertyCreator: (
    desc: DecoratorDescriptor
  ) => TaskProperty | TaskGroupProperty,
  baseOptions: TaskOptions | TaskGroupOptions = {}
): MethodOrPropertyDecoratorWithParams<[TaskOptions | TaskGroupOptions]> {
  return decoratorWithParams<object, [typeof baseOptions?]>(
    (target, key, desc, [userOptions] = []) => {
      const { initializer, value } = desc;
      delete desc.initializer;
      delete desc.value;

      return applyOptions(
        { ...baseOptions, ...userOptions },
        propertyCreator({ ...desc, initializer, value })
      )(target, key, desc);
    }
  );
}

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
  { restartable: true }
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
  { keepLatest: true }
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
