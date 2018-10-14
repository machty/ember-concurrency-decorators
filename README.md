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

You'll need at least `ember-cli@2.13+` and `ember-cli-babel@6+`.
Then install as any other addon:

```
ember install ember-concurrency-decorators
```

If you are _not_ using TypeScript, in order for [ember-cli-babel](https://github.com/babel/ember-cli-babel) to understand the `@decorator` syntax, you at least also need to install [`@ember-decorators/babel-transforms`](https://github.com/ember-decorators/babel-transforms). Instead of that you can also install the [`ember-decorators`](https://github.com/ember-decorators/ember-decorators) meta package:

```bash
ember install ember-decorators
# or
ember install @ember-decorators/babel-transforms
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

- **`@restartableTask`** -> `@task({ restartable: true })`
- **`@dropTask`** -> `@task({ drop: true })`
- **`@keepLatestTask`** -> `@task({ keepLatest: true })`
- **`@enqueueTask`** -> `@task({ enqueue: true })`

You can still pass further options to these decorators, like:

```js
@restartableTask({ maxConcurrency: 3 })
doStuff = function*() {
  // ...
}
```

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

- **`@restartableTaskGroup`** -> `@taskGroup({ restartable: true })`
- **`@dropTaskGroup`** -> `@taskGroup({ drop: true })`
- **`@keepLatestTaskGroup`** -> `@taskGroup({ keepLatest: true })`
- **`@enqueueTaskGroup`** -> `@taskGroup({ enqueue: true })`

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

### Syntax

#### TypeScript

Assuming you are using [ember-cli-typescript](https://github.com/typed-ember/ember-cli-typescript), you can just use native ES6 class syntax with decorators on generator methods.

```js
import Component from '@ember/component';
import { restartableTask } from 'ember-concurrency-decorators';

export default class ExampleComponent extends Component {
  @restartableTask
  *doStuff() {
    // ...
  }
});

// elsewhere:
this.doStuff.perform();
```

If you use [`@babel/plugin-transform-typescript`](https://babeljs.io/docs/en/next/babel-plugin-transform-typescript.html) with [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/next/babel-plugin-proposal-decorators.html) in `loose` mode (as you currently must), you can't use the above syntax. Instead read on below:

#### JavaScript

If you are using plain old JavaScript, use the decorators like this:

```js
import Component from '@ember/component';
import { restartableTask } from 'ember-concurrency-decorators';

export default class ExampleComponent extends Component {
  @restartableTask
  doStuff = function*() {
    // ...
  }
});

// elsewhere:
this.doStuff.perform();
```

You need to use this assignment / initializer syntax instead of "proper" generator methods, because of a bug in the `loose` mode of [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/next/babel-plugin-proposal-decorators.html), which ember-decorators depends on. When [ember-decorators adds support for stage 2 decorators](https://github.com/ember-decorators/ember-decorators/issues/278), you will be able to use the generator method syntax as well. 🎉

## License

This project is licensed under the [MIT License](LICENSE.md).
