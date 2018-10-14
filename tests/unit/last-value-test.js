import { module, test } from 'qunit';
import EmberObject from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { lastValue } from 'ember-concurrency-decorators';
import inRunLoop, {
  next as nextLoop
} from 'ember-concurrency-decorators/test-support/in-run-loop';

class ObjectWithTask extends EmberObject {
  @task
  task = function*() {
    return yield 'foo';
  };

  @lastValue('task')
  value;
}

class ObjectWithTaskDefaultValue extends ObjectWithTask {
  @lastValue('task')
  value = 'default value';
}

module('Unit | last-value', function(hooks) {
  inRunLoop(hooks);

  module('without a default value', function() {
    test('it returns nothing if the task has not been performed', function(assert) {
      const instance = ObjectWithTask.create();

      assert.deepEqual(instance.get('value'), undefined);
    });

    test('returning the last successful value', function(assert) {
      const instance = ObjectWithTask.create();

      instance.get('task').perform();
      nextLoop();

      assert.equal(instance.get('value'), 'foo');
    });
  });

  module('with a default value', function() {
    test('it returns the default value if the task has not been performed', function(assert) {
      const instance = ObjectWithTaskDefaultValue.create();

      assert.equal(instance.get('value'), 'default value');
    });

    test('returning the last successful value', function(assert) {
      const instance = ObjectWithTaskDefaultValue.create();

      instance.get('task').perform();
      nextLoop();

      assert.equal(instance.get('value'), 'foo');
    });
  });
});
