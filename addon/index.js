import { task as ecTask } from 'ember-concurrency';
import { computedDecoratorWithParams } from '@ember-decorators/utils/computed';
import { assert } from '@ember/debug';

function extractValue(desc) {
  return desc.value ||typeof desc.initializer === 'function' && desc.initializer() || null;
}

function taskify(desc) {
  if (!desc.writable) {
    throw new Error('ember-concurrency-decorators does not support using getters and setters');
  }
  const value = extractValue(desc);
  return (typeof value === 'function') ? ecTask(value) : value;
}

const applyOptions = (options, task) =>
  Object.entries(options).reduce(
    (task, [key, value]) => {
      if (value === true) {
        return task[key]();
      }
      if (typeof value === 'string' || typeof value === 'number') {
        return task[key](value);
      }
      assert(`ember-concurrency-decorators: Cannot apply option '${key}' of type ${typeof value} with value '${value}' to task. Either specify the option as 'true' or provide a numeric or string value.`)
      return task;
    }, task
  );

const createTaskDecorator = (baseOptions = {}) =>
  computedDecoratorWithParams(
    (target, key, desc, [userOptions]) =>
      applyOptions(
        Object.assign({}, baseOptions, userOptions),
        taskify(desc)
      )
  );

export const task = createTaskDecorator();
export const restartableTask = createTaskDecorator({ restartable: true });
export const dropTask = createTaskDecorator({ drop: true });
export const keepLatestTask = createTaskDecorator({ keepLatest: true });
export const enqueueTask = createTaskDecorator({ enqueue: true });
