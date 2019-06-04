import { module, test } from 'qunit';
import EmberObject from '@ember/object';
import { restartableTask } from 'ember-concurrency-decorators';

module('Unit | Babel Transform', function() {
  test('it can be used with decorators and TypeScript is happy', async function(assert) {
    class Obj extends EmberObject {
      foo = 1337;

      doStuff = restartableTask(function*(this: Obj, someArg: boolean) {
        yield Promise.resolve(someArg);
        return this.foo;
      });
    }

    const obj = Obj.create();
    await obj.doStuff.perform(false);

    assert.strictEqual(obj.doStuff.lastSuccessful!.value, obj.foo);
  });
});
