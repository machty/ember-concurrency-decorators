/*eslint-disable*/

import { run } from '@ember/runloop';
import { timeout } from 'ember-concurrency';
import {
  task,
  restartableTask,
  dropTask,
  keepLatestTask,
  enqueueTask,
  maxConcurrency
} from 'ember-concurrency-decorators';
import { module, test } from 'qunit';

module('Unit: decorators');

test("a plethora of decorators", function(assert) {
  assert.expect(1);

  let Obj = Ember.Object.extend({
    @task
    doStuff: function * () {
      return 123;
    },

    @restartableTask
    a: function * () { },

    @keepLatestTask
    b: function * () { },

    @dropTask
    c: function * () { },

    @enqueueTask
    d: function * () { },
  });

  let obj;
  run(() => {
    obj = Obj.create();
    obj.get('doStuff').perform();
  });
  assert.equal(obj.get('doStuff.last.value'), 123);
});

