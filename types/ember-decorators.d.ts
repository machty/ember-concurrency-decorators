declare module '@ember-decorators/utils/computed' {
  export function computedDecoratorWithParams<
    T extends object,
    K extends keyof T
  >(
    fn: (
      target: T,
      key: K,
      desc: PropertyDescriptor,
      params: any[]
    ) => PropertyDescriptor
  ): PropertyDecorator;
}
