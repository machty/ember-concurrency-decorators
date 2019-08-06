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

module('Unit | generator method', function() {
  test('Basic decorators functionality', function(assert) {
    assert.expect(5);

    class TestSubject extends EmberObject {
      @task
      *doStuff() {
        yield;
        return 123;
      }

      @restartableTask
      *a() {
        yield;
        return 456;
      }

      @keepLatestTask
      *b() {
        yield;
        return 789;
      }

      @dropTask
      *c() {
        yield;
        return 12;
      }

      @enqueueTask
      *d() {
        yield;
        return 34;
      }
    }

    let subject;
    run(() => {
      subject = TestSubject.create();
      subject.get('doStuff').perform();
      subject.get('a').perform();
      subject.get('b').perform();
      subject.get('c').perform();
      subject.get('d').perform();
    });
    assert.equal(subject.get('doStuff.last.value'), 123);
    assert.equal(subject.get('a.last.value'), 456);
    assert.equal(subject.get('b.last.value'), 789);
    assert.equal(subject.get('c.last.value'), 12);
    assert.equal(subject.get('d.last.value'), 34);
  });
});
