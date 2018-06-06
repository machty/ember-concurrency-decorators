import { task as ecTask } from 'ember-concurrency';
import { computedDecorator } from "@ember-decorators/utils/computed";

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

export const task = computedDecorator((target, key, desc) => taskify(desc));
export const restartableTask = computedDecorator((target, key, desc) => taskify(desc).restartable());
export const dropTask = computedDecorator((target, key, desc) => taskify(desc).drop());
export const keepLatestTask = computedDecorator((target, key, desc) => taskify(desc).keepLatest());
export const enqueueTask = computedDecorator((target, key, desc) => taskify(desc).enqueue());
