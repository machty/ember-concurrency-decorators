/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

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

    class TestSubject extends EmberObject {
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

      /* eslint-disable @typescript-eslint/no-empty-function */

      @task({ restartable: true }) restartable = function*() {};
      @task({ enqueue: true }) enqueue = function*() {};
      @task({ drop: true }) drop = function*() {};
      @task({ keepLatest: true }) keepLatest = function*() {};
      @task({ evented: true }) evented = function*() {};
      @task({ debug: true }) debug = function*() {};

      // Note: these options work even when strictFunctionTypes is enabled, but
      // turning it on in this repo breaks other things in addon/index.ts
      @task({ on: 'hi' }) on = function*() {};
      @task({ on: ['hi'] }) on1 = function*() {};
      @task({ on: ['hi', 'there'] }) on2 = function*() {};
      @task({ cancelOn: 'bye' }) cancelOn = function*() {};
      @task({ cancelOn: ['bye'] }) cancelOn1 = function*() {};
      @task({ cancelOn: ['bye', 'later'] }) cancelOn2 = function*() {};
      @task({ maxConcurrency: 1 }) maxConcurrency = function*() {};
      @task({ group: 'foo' }) group = function*() {};

      /* eslint-enable @typescript-eslint/no-empty-function */
    }

    let subject!: TestSubject;
    run(() => {
      subject = TestSubject.create();
      // @ts-ignore
      subject.get('doStuff').perform();
      // @ts-ignore
      subject.get('a').perform();
      // @ts-ignore
      subject.get('b').perform();
      // @ts-ignore
      subject.get('c').perform();
      // @ts-ignore
      subject.get('d').perform();
    });
    // @ts-ignore
    assert.equal(subject.get('doStuff.last.value'), 123);
    // @ts-ignore
    assert.equal(subject.get('a.last.value'), 456);
    // @ts-ignore
    assert.equal(subject.get('b.last.value'), 789);
    // @ts-ignore
    assert.equal(subject.get('c.last.value'), 12);
    // @ts-ignore
    assert.equal(subject.get('d.last.value'), 34);
  });

  // This has actually never worked.
  test('Encapsulated tasks', function(assert) {
    assert.expect(1);

    class TestSubject extends EmberObject {
      @task
      encapsulated = {
        privateState: 56,
        *perform() {
          yield;
          return this.privateState;
        }
      };
    }

    let subject!: TestSubject;
    run(() => {
      subject = TestSubject.create();
      subject.get('encapsulated').perform();
    });
    // @ts-ignore
    assert.equal(subject.get('encapsulated.last.value'), 56);
  });
});
