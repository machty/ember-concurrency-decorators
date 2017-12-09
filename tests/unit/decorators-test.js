import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import {
  task,
  restartableTask,
  dropTask,
  keepLatestTask,
  enqueueTask
} from 'ember-concurrency-decorators';
import { module, test } from 'qunit';

module('Unit: decorators');

test("a plethora of decorators", function(assert) {
  assert.expect(1);

  let Obj = EmberObject.extend({
    @task
    doStuff: function * () {
      yield;
      return 123;
    },

    @restartableTask
    a: function * () { yield; },

    @keepLatestTask
    b: function * () { yield; },

    @dropTask
    c: function * () { yield; },

    @enqueueTask
    d: function * () { yield; },
  });

  let obj;
  run(() => {
    obj = Obj.create();
    obj.get('doStuff').perform();
  });
  assert.equal(obj.get('doStuff.last.value'), 123);
});