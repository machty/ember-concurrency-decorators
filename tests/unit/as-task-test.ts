import { module, test } from 'qunit';
import EmberObject from '@ember/object';
import { asTask, task } from 'ember-concurrency-decorators';

module('Unit | asTask', function() {
  test('it can be used with decorators and TypeScript is happy', async function(assert) {
    class Obj extends EmberObject {
      foo = 1337;

      @task
      doStuff = asTask(function*(this: Obj, someArg: boolean) {
        yield Promise.resolve(someArg);
        return this.foo;
      });
    }

    const obj = Obj.create();
    await obj.doStuff.perform(false);

    assert.strictEqual(obj.doStuff.lastSuccessful!.value, obj.foo);
  });
});
