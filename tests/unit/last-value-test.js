import { module, test, skip } from 'qunit';
import EmberObject from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { lastValue } from 'ember-concurrency-decorators';
import inRunLoop, {
  next as nextLoop
} from 'ember-concurrency-decorators/test-support/in-run-loop';

module('Unit | last-value', function(hooks) {
  inRunLoop(hooks);

  hooks.beforeEach(function () {
    this.ObjectWithTask = class ObjectWithTask extends EmberObject {
      @task
      *task() {
        return yield 'foo';
      };

      @lastValue('task')
      value;
    }

    this.ObjectWithTaskDefaultValue = class ObjectWithTaskDefaultValue extends ObjectWithTask {
      @lastValue('task')
      value = 'default value';
    }
  });


  module('without a default value', function() {
    skip('it returns nothing if the task has not been performed', function(assert) {
      const instance = this.ObjectWithTask.create();

      assert.deepEqual(instance.get('value'), undefined);
    });

    skip('returning the last successful value', function(assert) {
      const instance = this.ObjectWithTask.create();

      instance.get('task').perform();
      nextLoop();

      assert.equal(instance.get('value'), 'foo');
    });
  });

  module('with a default value', function() {
    skip('it returns the default value if the task has not been performed', function(assert) {
      const instance = this.ObjectWithTaskDefaultValue.create();

      assert.equal(instance.get('value'), 'default value');
    });

    skip('returning the last successful value', function(assert) {
      const instance = this.ObjectWithTaskDefaultValue.create();

      instance.get('task').perform();
      nextLoop();

      assert.equal(instance.get('value'), 'foo');
    });
  });
});
