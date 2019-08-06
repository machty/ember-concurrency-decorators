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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TaskGroupProperty extends CommonTaskProperty {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TaskInstance {}
