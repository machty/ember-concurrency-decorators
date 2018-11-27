import { module, test } from 'qunit';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import {
  task,
  taskGroup,
  restartableTask,
  dropTask,
  keepLatestTask,
  enqueueTask
} from 'ember-concurrency-decorators';

module('Unit | decorators (JS) [legacy]', function() {
  test('Native classes (class extends EmberObject)', function(assert) {
    assert.expect(6);

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
      obj.get('doStuff').perform();
      obj.get('a').perform();
      obj.get('b').perform();
      obj.get('c').perform();
      obj.get('d').perform();
      obj.get('encapsulated').perform();
    });
    assert.equal(obj.get('doStuff.last.value'), 123);
    assert.equal(obj.get('a.last.value'), 456);
    assert.equal(obj.get('b.last.value'), 789);
    assert.equal(obj.get('c.last.value'), 12);
    assert.equal(obj.get('d.last.value'), 34);
    assert.equal(obj.get('encapsulated.last.value'), 56);
  });

  test('@taskGroup', function(assert) {
    assert.expect(2);

    class Obj extends EmberObject {
      @taskGroup
      group;

      @task({ group: 'group' })
      a = function*() {
        yield;
        return 123;
      };

      @task({ group: 'group' })
      b = function*() {
        yield;
        return 456;
      };
    }

    let obj;
    run(() => {
      obj = Obj.create();
      assert.rejects(obj.get('a').perform(), /was canceled/);
      assert.rejects(obj.get('b').perform(), /was canceled/);
      obj.get('group').cancelAll();
    });
  });
});
