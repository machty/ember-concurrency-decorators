export function task(fn: () => IterableIterator<any>): TaskProperty;

export function taskGroup(): TaskGroupProperty;

interface CommonTaskProperty {
  restartable: () => TaskProperty;
  drop: () => TaskProperty;
  keepLatest: () => TaskProperty;
  enqueue: () => TaskProperty;
  maxConcurrency: (n: number) => TaskProperty;
  cancelOn: (eventName: string) => TaskProperty;
  group: (groupName: string) => TaskProperty;
}

export interface TaskProperty extends CommonTaskProperty {
  evented: () => TaskProperty;
  debug: () => TaskProperty;
  on: (eventName: string) => TaskProperty;
}

export interface TaskGroupProperty extends CommonTaskProperty {}

export interface TaskInstance {}
