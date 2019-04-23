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

module('Unit | decorators', function() {
  test('Basic decorators functionality', function(assert) {
    assert.expect(5);

    class Obj extends EmberObject {
      @task
      doStuff = function*() {
        yield;
        return 123;
      };

      @restartableTask
      a = function*() {
        yield;
        return 456;
      };

      @keepLatestTask
      b = function*() {
        yield;
        return 789;
      };

      @dropTask
      c = function*() {
        yield;
        return 12;
      };

      @enqueueTask
      d = function*() {
        yield;
        return 34;
      };
    }

    let obj: Obj;
    run(() => {
      obj = Obj.create();
      // @ts-ignore
      obj.get('doStuff').perform();
      // @ts-ignore
      obj.get('a').perform();
      // @ts-ignore
      obj.get('b').perform();
      // @ts-ignore
      obj.get('c').perform();
      // @ts-ignore
      obj.get('d').perform();
    });
    // @ts-ignore
    assert.equal(obj!.get('doStuff.last.value'), 123);
    // @ts-ignore
    assert.equal(obj!.get('a.last.value'), 456);
    // @ts-ignore
    assert.equal(obj!.get('b.last.value'), 789);
    // @ts-ignore
    assert.equal(obj!.get('c.last.value'), 12);
    // @ts-ignore
    assert.equal(obj!.get('d.last.value'), 34);
  });

  // This has actually never worked.
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

    let obj: Obj;
    run(() => {
      obj = Obj.create();
      obj.get('encapsulated').perform();
    });
    // @ts-ignore
    assert.equal(obj!.get('encapsulated.last.value'), 56);
  });
});
