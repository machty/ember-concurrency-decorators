import ComputedProperty from "@ember/object/computed";

declare module 'ember-concurrency' {
  interface ConcurrencyModifiable {
    drop(): this;
    enqueue(): this;
    keepLatest(): this;
    restartable(): this;
    maxConcurrency(n: number): this;
    group(groupPath: string): this;
  }

  interface Triggerable {
    on(...eventName: string[]): this;
  }

  interface Cancelable {
    cancelOn(...eventName: string[]): this;
  }

  interface Debuggable {
    debug(): this;
  }

  interface Evented {
    evented(): this;
  }

  interface TaskGroup {
    cancelAll(): void;
  }

  interface Task extends TaskGroup {}

  interface TaskGroupProperty
    extends ConcurrencyModifiable,
      Triggerable,
      Cancelable,
      Debuggable,
      Evented {}

  interface TaskProperty
    extends ConcurrencyModifiable,
      Triggerable,
      Cancelable,
      Debuggable,
      Evented, ComputedProperty<() => Task> {}

  export function taskGroup(): TaskGroupProperty;

  export function task(
    generatorFunction: (...args: any[]) => any
  ): TaskProperty;

  export function task(encapsulatedTask: {
    perform: (...args: any[]) => any;
  }): TaskProperty;
}
