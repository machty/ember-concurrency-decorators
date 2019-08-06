import { decoratorWithRequiredParams } from '@ember-decorators/utils/decorator';
import { assert } from '@ember/debug';
import { get, computed } from '@ember/object';

/**
 * This decorator allows you to alias a property to the result of a task. You can also provide a default value to use before the task has completed.
 *
 * ```js
 * import Component from '@ember/component';
 * import { task } from 'ember-concurrency-decorators';
 * import { lastValue } from 'ember-concurrency-decorators';
 *
 * export default class ExampleComponent extends Component {
 *   @task
 *   someTask = function*() {
 *     // ...
 *   };
 *
 *   @lastValue('someTask')
 *   someTaskValue;
 *
 *   @lastValue('someTask')
 *   someTaskValueWithDefault = 'A default value';
 * }
 * ```
 *
 * @function
 * @param {string} taskName the name of the task to read a value from
 */
// eslint-disable-next-line func-names
export default decoratorWithRequiredParams(function lastValue<
  Target extends object
>(
  target: Target,
  key: keyof Target,
  desc: PropertyDescriptor & { initializer?: () => any },
  [taskName]: [string]
) {
  assert(
    `ember-concurrency-decorators: @lastValue expects a task name as the first parameter.`,
    typeof taskName === 'string'
  );

  const { initializer } = desc;
  delete desc.initializer;

  const cp = computed(`${taskName}.lastSuccessful`, function() {
    const lastInstance = get(this, `${taskName}.lastSuccessful`);

    if (lastInstance) {
      return get(lastInstance, 'value');
    }

    if (initializer) {
      return initializer.call(this);
    }
  });

  // @ts-ignore
  return cp(target, key, desc);
}) as (taskName: string) => PropertyDecorator;
