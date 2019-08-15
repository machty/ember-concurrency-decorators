# ember-concurrency-decorators

[![Build Status](https://travis-ci.org/machty/ember-concurrency-decorators.svg)](https://travis-ci.org/machty/ember-concurrency-decorators)
[![npm version](https://badge.fury.io/js/ember-concurrency-decorators.svg)](http://badge.fury.io/js/ember-concurrency-decorators)
[![Download Total](https://img.shields.io/npm/dt/ember-concurrency-decorators.svg)](http://badge.fury.io/js/ember-concurrency-decorators)
[![Ember Observer Score](https://emberobserver.com/badges/ember-concurrency-decorators.svg)](https://emberobserver.com/addons/ember-concurrency-decorators)
[![Ember Versions](https://img.shields.io/badge/Ember.js%20Versions-%5E2.12%20%7C%7C%20%5E3.0-brightgreen.svg)](https://travis-ci.org/machty/ember-concurrency-decorators)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![dependencies](https://img.shields.io/david/machty/ember-concurrency-decorators.svg)](https://david-dm.org/machty/ember-concurrency-decorators)
[![devDependencies](https://img.shields.io/david/dev/machty/ember-concurrency-decorators.svg)](https://david-dm.org/machty/ember-concurrency-decorators)

This Ember addon lets you use the
[decorator syntax](https://github.com/tc39/proposal-decorators)
for declaring/configuring
[ember-concurrency](https://ember-concurrency.com) tasks.

## Installation

⚠️👉 Check the [FAQ](#faq), if something isn't working or you're not sure what
to do.

### Stage 1 Decorators

Requirements:

- At least `ember-cli-babel@^7.7.2`
- At least `@babel/core@^7.5.0` (as a transitive dependency via `ember-cli-babel`)
- At least `ember-cli-typescript@^2.0.0`, if you want to use it with TypeScript
- `@ember-decorators/babel-transforms` is _not_ installed
- The rest of `@ember-decorators`, if present, is `^6.0.0`
- Below Ember v3.10: [`ember-decorators-polyfill`][ember-decorators-polyfill]

[ember-decorators-polyfill]: https://github.com/pzuraq/ember-decorators-polyfill

Then install the `latest` release:

```
ember install ember-concurrency-decorators
```

### Stage 2 Decorators

If you are still using stage 2 decorators, I recommend that you refactor away
from them as soon as possible.

Requirements:

- at least `ember-cli-babel@^7.7.2`
- `@ember-decorators/babel-transforms` _is_ installed
- The rest of `@ember-decorators`, if present, is `^5.0.0` (below `6.0.0`)

Then install the [`legacy`][stage-2] version:

[stage-2]: https://github.com/machty/ember-concurrency-decorators/tree/v0.6.0

```
ember install ember-concurrency-decorators@legacy
```

The following documentation will not be accurate. Instead refer to the
[docs for stage 2 decorators][stage-2].

## Usage

### Available decorators

- **[`@task`](#task)**: turns a generator method into a task
  - `@restartableTask`
  - `@dropTask`
  - `@keepLatestTask`
  - `@enqueueTask`
- **[`@taskGroup`](#taskgroup)**: creates a task group from a property
  - `@restartableTaskGroup`
  - `@dropTaskGroup`
  - `@keepLatestTaskGroup`
  - `@enqueueTaskGroup`
- **[`@lastValue`](#lastvalue)**: alias a property to the result of a task with an optional default value

#### `@task`

```js
import Component from '@ember/component';
import { task } from 'ember-concurrency-decorators';

export default class ExampleComponent extends Component {
  @task
  doStuff = function*() {
    // ...
  };

  // and then elsewhere
  executeTheTask() {
    // `doStuff` is still a `Task` object that can be `.perform()`ed
    this.doStuff.perform();
    console.log(this.doStuff.isRunning);
  }
}
```

You can also pass further options to the task decorator:

```js
@task({
  maxConcurrency: 3,
  restartable: true
})
doStuff = function*() {
  // ...
}
```

For your convenience, there are extra decorators for all [concurrency modifiers](http://ember-concurrency.com/docs/task-concurrency):

| Shorthand          | Equivalent                     |
| ------------------ | ------------------------------ |
| `@restartableTask` | `@task({ restartable: true })` |
| `@dropTask`        | `@task({ drop: true })`        |
| `@keepLatestTask`  | `@task({ keepLatest: true })`  |
| `@enqueueTask`     | `@task({ enqueue: true })`     |

You can still pass further options to these decorators, like:

```js
@restartableTask({ maxConcurrency: 3 })
doStuff = function*() {
  // ...
}
```

##### Encapsulated Tasks

> [Encapsulated Tasks](http://ember-concurrency.com/docs/encapsulated-task) behave just like regular tasks, but with one crucial difference: the value of `this` within the task function points to the currently running TaskInstance, rather than the host object that the task lives on (e.g. a Component, Controller, etc). This allows for some nice patterns where all of the state produced/mutated by a task can be contained (encapsulated) within the Task itself, rather than having to live on the host object.

```js
import Component from '@ember/component';
import { task } from 'ember-concurrency-decorators';

export default class ExampleComponent extends Component {
  @task
  doStuff = {
    privateState: 123,
    *perform() {
      // ...
    }
  };

  // and then elsewhere
  executeTheTask() {
    // `doStuff` is still a `Task` object that can be `.perform()`ed
    this.doStuff.perform();
    console.log(this.doStuff.isRunning);
  }
}
```

Encapsulated Tasks do not work with `ember-cli-typescript@1`. See the
[TypeScript](#TypeScript) section for more details.

#### `@taskGroup`

```js
import Component from '@ember/component';
import { task, taskGroup } from 'ember-concurrency-decorators';

export default class ExampleComponent extends Component {
  @taskGroup
  someTaskGroup;

  @task({ group: 'someTaskGroup' })
  doStuff = function*() {
    // ...
  };

  @task({ group: 'someTaskGroup' })
  doOtherStuff = function*() {
    // ...
  };

  // and then elsewhere
  executeTheTask() {
    // `doStuff` is still a `Task `object that can be `.perform()`ed
    this.doStuff.perform();

    // `someTaskGroup` is still a `TaskGroup` object
    console.log(this.someTaskGroup.isRunning);
  }
}
```

You can also pass further options to the task group decorator:

```js
@taskGroup({
  maxConcurrency: 3,
  drop: true
}) someTaskGroup;
```

As for `@task`, there are extra decorators for all [concurrency modifiers](http://ember-concurrency.com/docs/task-concurrency):

| Shorthand               | Equivalent                          |
| ----------------------- | ----------------------------------- |
| `@restartableTaskGroup` | `@taskGroup({ restartable: true })` |
| `@dropTaskGroup`        | `@taskGroup({ drop: true })`        |
| `@keepLatestTaskGroup`  | `@taskGroup({ keepLatest: true })`  |
| `@enqueueTaskGroup`     | `@taskGroup({ enqueue: true })`     |

You can still pass further options to these decorators, like:

```js
@dropTaskGroup({ maxConcurrency: 3 }) someTaskGroup;
```

#### `@lastValue`

This decorator allows you to alias a property to the result of a task. You can also provide a default value to use before the task has completed.

```js
import Component from '@ember/component';
import { task } from 'ember-concurrency-decorators';
import { lastValue } from 'ember-concurrency-decorators';

export default class ExampleComponent extends Component {
  @task
  someTask = function*() {
    // ...
  };

  @lastValue('someTask')
  someTaskValue;

  @lastValue('someTask')
  someTaskValueWithDefault = 'A default value';
}
```

## FAQ

### Compatibility and Weird Errors

The specification for decorators in broader JavaScript has been in flux.
Unfortunately, that means if you have been an early adopter of decorators in
your Ember application, you may need to deal with some API churn.

[(You can read an excellent discussion on decorators here.)](https://www.pzuraq.com/coming-soon-in-ember-octane-part-1-native-classes/)

Check the above [requirements](#installation) to see what version you need to
install.

If you are sure, that you fulfilled the requirements correctly, but are still
experiencing weird errors, install
[`ember-cli-dependency-lint`][ember-cli-dependency-lint] to ensure that you are
not accidentally including outdated versions of `ember-decorators` as transitive
dependencies.

[ember-cli-dependency-lint]: https://github.com/salsify/ember-cli-dependency-lint

If it's still not working after that, please [create an issue][new-issue].

[new-issue]: https://github.com/machty/ember-concurrency-decorators/issues/new

### TypeScript Support

You can use this package with `ember-cli-typescript@2`. _But_ unfortunately
decorators cannot yet change the type signature of the decorated element. This
is why you are getting type errors like:

```ts
import { task } from 'ember-concurrency-decorators';

export default class Foo {
  @task
  doStuff = function*(this: Foo) {
    // ...
  };

  executeTheTask() {
    this.doStuff.perform();
  }
}
```

```
TS2339: Property 'perform' does not exist on type '() => IterableIterator<any>'.
```

Check issue [#30][issue-typescript] for more details.

[issue-typescript]: https://github.com/machty/ember-concurrency-decorators/issues/30

Very soon, you will be able to use the following syntax instead with TypeScript:

```ts
import { task } from 'ember-concurrency-decorators';

export default class Foo {
  @task
  doStuff = task(function*(this: Foo) {
    // ...
  });

  executeTheTask() {
    this.doStuff.perform();
  }
}
```

This might not be using a fancy generator method, but it is 💯 type-safe! 🎉

Check the [PR #56][pr-typescript] for progress.

[pr-typescript]: https://github.com/machty/ember-concurrency-decorators/pull/56

### Do I _need_ this addon?

No! If you are using Ember v3.10.0 or above, you can use `ember-concurrency`
directly, like this:

```js
import { task } from 'ember-concurrency';

class Foo {
  @(task(function*() {
    // ...
  }).restartable())
  doStuff;

  executeTheTask() {
    this.doStuff.perform();
  }
}
```

_However_:

- This syntax will not continue to work with the new "static decorators"
  proposal that is set to replace the stage 1 decorators eventually.
- This does not properly type-check with TypeScript. See
  [TypeScript Support](#typescript-support) for more details.
- I think this looks hideous, but that is just an opinion.

Eventually, all work in `ember-concurrency-decorators` will likely flow back
into `ember-concurrency` at some point. Until then, we want to mature and
test-drive the API here first.

## License

This project is licensed under the [MIT License](LICENSE.md).
