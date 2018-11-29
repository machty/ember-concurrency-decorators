import { get, computed } from '@ember/object';
import { decorator } from '@ember-decorators/utils/decorator';
import { computedDecorator } from '@ember-decorators/utils/computed';
import { assert } from '@ember/debug';

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
export default function lastValue(taskName) {
  assert(
    `ember-concurrency-decorators: @lastValue expects a task name as the first parameter.`,
    typeof taskName === 'string'
  );

  return decorator(desc => {
    const { initializer } = desc;
    delete desc.initializer;

    return computedDecorator(() =>
      computed(`${taskName}.lastSuccessful`, function() {
        const lastInstance = get(this, `${taskName}.lastSuccessful`);

        if (lastInstance) {
          return get(lastInstance, 'value');
        }

        if (initializer) {
          return initializer.call(this);
        }
      })
    )(desc);
  });
}
