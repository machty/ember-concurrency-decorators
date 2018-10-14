import { get, computed } from '@ember/object';
import { computedDecoratorWithParams } from '@ember-decorators/utils/computed';

/**
 * This decorator allows you to alias a property to the result of a task. You can also provide a default value to use before the task has completed.
 *
 * ```js
 * import Component from "@ember/component";
 * import { task } from "ember-concurrency-decorators";
 * import { lastValue } from "ember-concurrency-decorators";
 *
 * export default class ExampleComponent extends Component {
 *   @task
 *   someTask = function*() {
 *     // ...
 *   };
 *
 *   @lastValue("someTask")
 *   someTaskValue;
 *
 *   @lastValue("someTask")
 *   someTaskValueWithDefault = "A default value";
 * }
 * ```
 *
 * @function
 * @param {string} taskName the name of the task to read a value from
 */
export default computedDecoratorWithParams(function(target, key, desc, [task]) {
  return computed(`${task}.lastSuccessful.value`, function() {
    const lastInstance = get(this, `${task}.lastSuccessful`);

    if (lastInstance) {
      return get(lastInstance, 'value');
    }

    if (desc.initializer) {
      return desc.initializer();
    }
  });
});
