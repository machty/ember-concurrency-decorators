type GeneratorFn<Args extends any[] = any[], R = any> = (
  ...args: Args
) => IterableIterator<R>;

interface Task<Args extends any[], R> {
  perform(...args: Args): Promise<R>;
  lastSuccessful?: {
    value: R;
  };
  // ...
}

export default function asTask<Args extends any[], R>(
  task: GeneratorFn<Args, R>
): Task<Args, Exclude<R, Promise<any>>> {
  // @ts-ignore
  return task;
}
