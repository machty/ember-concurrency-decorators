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
      readonly someProperty = 123;

      @task
      doStuff = task(function*(this: TestSubject) {
        yield;
        return this.someProperty;
      });

      @task
      withParameters = task(function*(foo: string, bar: boolean) {
        yield;
        return { foo, bar };
      });

      @restartableTask
      a = task(function*() {
        yield;
        return 456;
      });

      @keepLatestTask
      b = task(function*() {
        yield;
        return 789;
      });

      @dropTask
      c = task(function*() {
        yield;
        return 12;
      });

      @enqueueTask
      d = task(function*() {
        yield;
        return 34;
      });
    }

    let subject!: TestSubject;
    run(() => {
      subject = TestSubject.create();
      subject.get('doStuff').perform();
      subject.get('withParameters').perform('abc', true);
      subject.get('a').perform();
      subject.get('b').perform();
      subject.get('c').perform();
      subject.get('d').perform();
    });
    assert.equal(
      subject
        .get('doStuff')
        .get('last')!
        .get('value'),
      123
    );
    assert.deepEqual(
      subject
        .get('withParameters')
        .get('last')!
        .get('value'),
      { foo: 'abc', bar: true }
    );
    assert.equal(
      subject
        .get('a')
        .get('last')!
        .get('value'),
      456
    );
    assert.equal(
      subject
        .get('b')
        .get('last')!
        .get('value'),
      789
    );
    assert.equal(
      subject
        .get('c')
        .get('last')!
        .get('value'),
      12
    );
    assert.equal(
      subject
        .get('d')
        .get('last')!
        .get('value'),
      34
    );
  });

  // This has actually never worked.
  test('Encapsulated tasks', function(assert) {
    assert.expect(1);

    class TestSubject extends EmberObject {
      @task
      encapsulated = task({
        privateState: 56,
        *perform(_foo: string) {
          yield;
          return this.privateState; // @TODO: broken
        }
      });
    }

    let subject!: TestSubject;
    run(() => {
      subject = TestSubject.create();
      subject.get('encapsulated').perform('abc');
    });
    assert.equal(
      subject
        .get('encapsulated')
        .get('last')!
        .get('value'),
      56
    );
  });
});
