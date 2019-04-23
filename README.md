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

This package only works with Ember Octane, which is currently the latest Ember
Beta. You'll need at least `ember-cli-babel@^7.7.2` and _not_ use
`@ember-decorators/babel-transforms`, so that you get the Ember.js vanilla
stage 1 / legacy decorators.
Then install as any other addon:

```
ember install ember-concurrency-decorators@beta
```

For non-Octane apps, use the [latest version](https://github.com/machty/ember-concurrency-decorators/tree/v0.6.0):

```
ember install ember-concurrency-decorators
```

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

## License

This project is licensed under the [MIT License](LICENSE.md).
