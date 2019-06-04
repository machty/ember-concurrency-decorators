export type Decorator = (
  ...args: Parameters<MethodDecorator>
) => Exclude<ReturnType<MethodDecorator>, void>;

export type ObjectValues<O> = O extends { [s: string]: infer V } ? V : never;

export type GeneratorFn<Args extends any[] = any[], R = any> = (
  ...args: Args
) => IterableIterator<R>;
