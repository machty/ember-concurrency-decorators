import { module, test } from 'qunit';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import {
  task,
  restartableTask,
  dropTask,
  keepLatestTask,
  enqueueTask
} from 'ember-concurrency-decorators';

module('Unit | decorators (JS)', function() {
  test('Basic decorators functionality', function(assert) {
    assert.expect(5);

    class Obj extends EmberObject {
      @task
      *doStuff() {
        yield;
        return 123;
      };

      @restartableTask
      *a() {
        yield;
        return 456;
      };

      @keepLatestTask
      *b() {
        yield;
        return 789;
      };

      @dropTask
      *c() {
        yield;
        return 12;
      };

      @enqueueTask
      *d() {
        yield;
        return 34;
      };
    }

    let obj;
    run(() => {
      obj = Obj.create();
      obj.get('doStuff').perform();
      obj.get('a').perform();
      obj.get('b').perform();
      obj.get('c').perform();
      obj.get('d').perform();
    });
    assert.equal(obj.get('doStuff.last.value'), 123);
    assert.equal(obj.get('a.last.value'), 456);
    assert.equal(obj.get('b.last.value'), 789);
    assert.equal(obj.get('c.last.value'), 12);
    assert.equal(obj.get('d.last.value'), 34);
  });

  test('Encapsulated tasks', function(assert) {
    assert.expect(1);

    class Obj extends EmberObject {
      @task
      encapsulated = {
        privateState: 56,
        *perform() {
          yield;
          return this.privateState;
        }
      };
    }

    let obj;
    run(() => {
      obj = Obj.create();
      obj.get('encapsulated').perform();
    });
    assert.equal(obj.get('encapsulated.last.value'), 56);
  });
});
