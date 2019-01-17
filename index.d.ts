interface TaskGroupOptions {
  restartable?: true;
  drop?: true;
  keepLatest?: true;
  enqueue?: true;
  maxConcurrency?: number;
  cancelOn?: string;
  group?: string;
}

interface TaskOptions {
  restartable?: true;
  drop?: true;
  keepLatest?: true;
  enqueue?: true;
  evented?: true;
  debug?: true;
  maxConcurrency?: number;
  on?: string;
  cancelOn?: string;
  group?: string;
}

export function asTask<Args extends any[], R>(
  task: GeneratorFn<Args, R>
): Task<Args, Exclude<R, Promise<any>>>;
export function asTask<Args extends any[], R>(task: {
  perform: GeneratorFn<Args, R>;
}): Task<Args, Exclude<R, Promise<any>>>;

export interface Task<Args extends any[], R> {
  perform(...args: Args): Promise<R>;
  lastSuccessful?: {
    value: R;
  };
  // ...
}
export interface TaskGroup {
  cancelAll(): void;
  // ...
}

type GeneratorFn<Args extends any[] = any[], R = any> = (
  ...args: Args
) => IterableIterator<R>;

type ExtractPropertyNamesOfType<T, S> = {
  [K in keyof T]: T[K] extends S ? K : never
}[keyof T];

type TaskMethodKeys<T> = ExtractPropertyNamesOfType<T, GeneratorFn>;
type EncapsulatedTaskKeys<T> = ExtractPropertyNamesOfType<
  T,
  { perform: GeneratorFn }
>;

type TaskDecorator<O extends object> =
  | ((target: O, propertyKey: EncapsulatedTaskKeys<O>) => void)
  | ((
      target: O,
      propertyKey: TaskMethodKeys<O>,
      descriptor: PropertyDescriptor
    ) => void);

type TaskGroupDecorator = PropertyDecorator;
type TaskGroupDecoratorWithOptionalParams = TaskGroupDecorator &
  ((options: TaskGroupOptions) => TaskGroupDecorator);

export function task<O extends object>(
  target: O,
  propertyKey: TaskMethodKeys<O>,
  descriptor: PropertyDescriptor
): void;
export function task<O extends object>(
  target: O,
  propertyKey: EncapsulatedTaskKeys<O>
): void;
export function task<O extends object>(options: TaskOptions): TaskDecorator<O>;

export function restartableTask<O extends object>(
  target: O,
  propertyKey: TaskMethodKeys<O>,
  descriptor: PropertyDescriptor
): void;
export function restartableTask<O extends object>(
  target: O,
  propertyKey: EncapsulatedTaskKeys<O>
): void;
export function restartableTask<O extends object>(
  options: TaskOptions
): TaskDecorator<O>;

export function dropTask<O extends object>(
  target: O,
  propertyKey: TaskMethodKeys<O>,
  descriptor: PropertyDescriptor
): void;
export function dropTask<O extends object>(
  target: O,
  propertyKey: EncapsulatedTaskKeys<O>
): void;
export function dropTask<O extends object>(
  options: TaskOptions
): TaskDecorator<O>;

export function keepLatestTask<O extends object>(
  target: O,
  propertyKey: TaskMethodKeys<O>,
  descriptor: PropertyDescriptor
): void;
export function keepLatestTask<O extends object>(
  target: O,
  propertyKey: EncapsulatedTaskKeys<O>
): void;
export function keepLatestTask<O extends object>(
  options: TaskOptions
): TaskDecorator<O>;

export function enqueueTask<O extends object>(
  target: O,
  propertyKey: TaskMethodKeys<O>,
  descriptor: PropertyDescriptor
): void;
export function enqueueTask<O extends object>(
  target: O,
  propertyKey: EncapsulatedTaskKeys<O>
): void;
export function enqueueTask<O extends object>(
  options: TaskOptions
): TaskDecorator<O>;

export const taskGroup: TaskGroupDecoratorWithOptionalParams;
export const restartableTaskGroup: TaskGroupDecoratorWithOptionalParams;
export const dropTaskGroup: TaskGroupDecoratorWithOptionalParams;
export const keepLatestTaskGroup: TaskGroupDecoratorWithOptionalParams;
export const enqueueTaskGroup: TaskGroupDecoratorWithOptionalParams;

export function lastValue<O extends object, T extends keyof O>(
  taskName: T
): (target: O, propertyKey: T) => void;
