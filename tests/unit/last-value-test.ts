/* eslint-disable max-classes-per-file */
import { module, test } from 'qunit';

import EmberObject from '@ember/object';

import { task } from 'ember-concurrency-decorators';
import { lastValue } from 'ember-concurrency-decorators';
import inRunLoop, {
  next as nextLoop
} from 'ember-concurrency-decorators/test-support/in-run-loop';

module('Unit | last-value', function(hooks) {
  inRunLoop(hooks);

  test('without a default value', function(assert) {
    class ObjectWithTask extends EmberObject {
      @task
      task = function*() {
        return yield 'foo';
      };

      @lastValue('task')
      value?: 'foo';
    }

    const instance = ObjectWithTask.create();
    assert.strictEqual(
      instance.get('value'),
      undefined,
      'it returns nothing if the task has not been performed'
    );

    // @ts-ignore
    instance.get('task').perform();
    nextLoop();

    assert.strictEqual(
      instance.get('value'),
      'foo',
      'returning the last successful value'
    );
  });

  test('without a default value (using wrapper for TS support)', function(assert) {
    class ObjectWithTask extends EmberObject {
      @task
      task = task(function*() {
        return yield 'foo';
      });

      @lastValue('task')
      value?: 'foo';
    }

    const instance = ObjectWithTask.create();
    assert.strictEqual(
      instance.get('value'),
      undefined,
      'it returns nothing if the task has not been performed'
    );

    instance.get('task').perform();
    nextLoop();

    assert.strictEqual(
      instance.get('value'),
      'foo',
      'returning the last successful value'
    );
  });

  test('with a default value', function(assert) {
    class ObjectWithTaskDefaultValue extends EmberObject {
      @task
      task = function*() {
        return yield 'foo';
      };

      @lastValue('task')
      value = 'default value';
    }

    const instance = ObjectWithTaskDefaultValue.create();

    assert.strictEqual(
      instance.get('value'),
      'default value',
      'it returns the default value if the task has not been performed'
    );

    // @ts-ignore
    instance.get('task').perform();
    nextLoop();

    assert.equal(
      instance.get('value'),
      'foo',
      'returning the last successful value'
    );
  });

  test('with a default value (using wrapper for TS support)', function(assert) {
    class ObjectWithTaskDefaultValue extends EmberObject {
      @task
      task = task(function*() {
        return yield 'foo';
      });

      @lastValue('task')
      value = 'default value';
    }

    const instance = ObjectWithTaskDefaultValue.create();

    assert.strictEqual(
      instance.get('value'),
      'default value',
      'it returns the default value if the task has not been performed'
    );

    instance.get('task').perform();
    nextLoop();

    assert.equal(
      instance.get('value'),
      'foo',
      'returning the last successful value'
    );
  });
});
