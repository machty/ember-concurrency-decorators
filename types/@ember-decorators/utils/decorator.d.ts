declare module '@ember-decorators/utils/decorator' {
  export interface DecoratorDescriptor extends PropertyDescriptor {
    initializer?: () => unknown;
  }

  type DecoratorFunction<Target extends object, Params extends unknown[]> = (
    target: Target,
    key: keyof Target,
    desc: DecoratorDescriptor,
    params: Params
  ) => DecoratorDescriptor;

  /**
   * A macro that takes a decorator function and allows it to optionally
   * receive parameters
   *
   * ```js
   * let foo = decoratorWithParams((target, desc, key, params) => {
   *   console.log(params);
   * });
   *
   * class {
   *   @foo bar; // undefined
   *   @foo('bar') baz; // ['bar']
   * }
   * ```
   *
   * @param {Function} fn - decorator function
   */
  export function decoratorWithParams<
    Target extends object,
    Params extends unknown[]
  >(
    fn: DecoratorFunction<Target, Params>
  ): (MethodDecorator & PropertyDecorator) &
    ((...params: Params) => MethodDecorator & PropertyDecorator);

  /**
   * A macro that takes a decorator function and requires it to receive
   * parameters:
   *
   * ```js
   * let foo = decoratorWithRequiredParams((target, desc, key, params) => {
   *   console.log(params);
   * });
   *
   * class {
   *   @foo('bar') baz; // ['bar']
   *   @foo bar; // Error
   * }
   * ```
   *
   * @param {Function} fn - decorator function
   */
  export function decoratorWithRequiredParams<
    Target extends object,
    Params extends unknown[]
  >(
    fn: DecoratorFunction<Target, Params>,
    name?: string
  ): (MethodDecorator & PropertyDecorator) &
    ((...params: Params) => MethodDecorator & PropertyDecorator);
}
