export interface DecoratorDescriptor extends PropertyDescriptor {
  initializer?: () => any;
}

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
  Params extends any[],
  Target extends object
>(
  fn: (
    target: Target,
    key: keyof Target,
    desc: DecoratorDescriptor,
    params: Params
  ) => DecoratorDescriptor,
  name?: string
): MethodDecorator &
  PropertyDecorator &
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
  Params extends any[],
  Target extends object
>(
  fn: (
    target: Target,
    key: keyof Target,
    desc: DecoratorDescriptor,
    params: Params
  ) => DecoratorDescriptor,
  name?: string
): (...params: Params) => MethodDecorator & PropertyDecorator;
