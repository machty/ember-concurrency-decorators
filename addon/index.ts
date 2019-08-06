import {
  decoratorWithParams,
  DecoratorDescriptor
} from '@ember-decorators/utils/decorator';
import { assert } from '@ember/debug';

import {
  task as createTaskProperty,
  taskGroup as createTaskGroupProperty,
  TaskProperty,
  TaskGroupProperty,
  Task,
  GeneratorFn
} from 'ember-concurrency';

export { default as lastValue } from './last-value';

type TaskOptions = {
  [option in keyof TaskProperty]?: Parameters<TaskProperty[option]> extends [
    infer P
  ]
    ? P
    : true;
};
type TaskGroupOptions = {
  [option in keyof TaskGroupProperty]?: Parameters<
    TaskGroupProperty[option]
  > extends [infer P]
    ? P
    : true;
};

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
function extractValue(desc: DecoratorDescriptor): any {
  if (typeof desc.initializer === 'function') {
    return desc.initializer.call(null);
  }
  if (typeof desc.get === 'function') {
    return desc.get.call(null);
  }
  if (desc.value) {
    return desc.value;
  }
}

/**
 * Takes a `PropertyDescriptor` and turns it into an ember-concurrency
 * `TaskProperty`.
 *
 * @param desc
 * @returns {TaskProperty}
 * @private
 */
function createTaskFromDescriptor(desc: DecoratorDescriptor) {
  const value = extractValue(desc);
  assert(
    'ember-concurrency-decorators: Can only decorate a generator function as a task or an object with a generator method `perform` as an encapsulated task.',
    typeof value === 'function' ||
      (typeof value === 'object' && typeof value.perform === 'function')
  );

  return (createTaskProperty(value) as unknown) as TaskProperty;
}

/**
 * Takes a `PropertyDescriptor` and turns it into an ember-concurrency
 * `TaskGroupProperty`.
 *
 * @param desc
 * @returns {TaskGroupProperty}
 * @private
 */
function createTaskGroupFromDescriptor(_desc: DecoratorDescriptor) {
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
  taskProperty: TaskGroupProperty
): TaskGroupProperty & Decorator;
function applyOptions(
  options: TaskOptions,
  taskProperty: TaskProperty
): TaskProperty & Decorator {
  return Object.entries(options).reduce(
    (
      // eslint-disable-next-line no-shadow
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
      return (taskProperty[key] as (o: typeof value) => typeof taskProperty)(
        value
      );
    },
    taskProperty
    // The CP decorator gets executed in `createDecorator`
  ) as TaskProperty & Decorator;
}

/**
 * Creates a decorator function that transforms the decorated property using the
 * given `propertyCreator` and accepts an optional user provided options hash,
 * that that will be merged with the `baseOptions`.
 *
 * @param {function} propertyCreator
 * @param {object} [baseOptions={}]
 * @private
 */
const createDecorator = (
  propertyCreator: (
    desc: DecoratorDescriptor
  ) => TaskProperty | TaskGroupProperty,
  baseOptions: TaskOptions | TaskGroupOptions = {}
) =>
  decoratorWithParams<[typeof baseOptions?], object>(
    (target, key, desc, [userOptions] = []) => {
      const { initializer, value } = desc;
      delete desc.initializer;
      delete desc.value;

      return applyOptions(
        Object.assign({}, baseOptions, userOptions),
        propertyCreator({ ...desc, initializer, value })
      )(target, key, desc);
    }
  ) as (PropertyDecorator &
    ((options: Record<string, any>) => PropertyDecorator));

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
const taskDecorator = createDecorator(createTaskFromDescriptor);

export function task<Args extends any[], R>(
  taskFn: GeneratorFn<Args, R>
): Task<Args, Exclude<R, Promise<any>>>;
export function task<Args extends any[], R>(encapsulatedTask: {
  perform: GeneratorFn<Args, R>;
}): Task<Args, Exclude<R, Promise<any>>>;
export function task(options: TaskOptions): PropertyDecorator;
export function task(
  target: Record<string, any>,
  propertyKey: string | symbol
): void;
export function task<Args extends any[], R>(
  ...args:
    | [GeneratorFn<Args, R>]
    | [{ perform: GeneratorFn<Args, R> }]
    | [TaskOptions]
    | [Record<string, any>, string | symbol]
): Task<Args, Exclude<R, Promise<any>>> | PropertyDecorator | void {
  const [firstParam] = args;
  if (
    typeof firstParam === 'function' ||
    (typeof firstParam === 'object' &&
      // @ts-ignore
      typeof firstParam.perform === 'function')
  )
    // @ts-ignore
    return firstParam;
  // @ts-ignore
  return taskDecorator(...args);
}

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
