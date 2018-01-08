import { task as ecTask } from 'ember-concurrency';
import { decorator } from '@ember-decorators/utils/decorator-wrappers';
import extractValue from '@ember-decorators/utils/extract-value';

function taskify(desc) {
  if (!desc.writable) {
    throw new Error('ember-concurrency-decorators does not support using getters and setters');
  }
  let value = extractValue(desc);
  return (typeof value === 'function') ? ecTask(value) : value;
}

export const task = decorator((target, key, desc) => taskify(desc));
export const restartableTask = decorator((target, key, desc) => taskify(desc).restartable());
export const dropTask = decorator((target, key, desc) => taskify(desc).drop());
export const keepLatestTask = decorator((target, key, desc) => taskify(desc).keepLatest());
export const enqueueTask = decorator((target, key, desc) => taskify(desc).enqueue());
