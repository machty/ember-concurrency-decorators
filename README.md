# ember-concurrency-decorators

## EXPERIMENTAL

Babel support for decorator syntax has been fidgety, so expect a bit
of a bumpy ride. Also, the API of this addon is still pre-Alpha.
Probably don't use this in prod code.

Also give the [ember-decorators docs](https://ember-decorators.github.io/ember-decorators/) a read.

## Overview

This Ember Addon let's you use the
[decorator syntax](https://github.com/tc39/proposal-decorators)
for declaring/configuring
[ember-concurrency](https://ember-concurrency.com) tasks.
Check out this [weaksauce
test](https://github.com/machty/ember-concurrency-decorators/blob/master/tests/unit/decorators-js-test.js#L17) to see all the decorators you can use.

### Before

Classic syntax without decorators.

```js
import Component from '@ember/decorators';
import { task } from 'ember-concurrency';

export default Ember.Component.extend({
  doStuff: task(function*() {
    // ...
  }).restartable()
});

// elsewhere:
this.get('doStuff').perform();
```

### After

#### JavaScript

##### ES6 class syntax with decorators

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
this.get('doStuff').perform();
// `doStuff` is still a Task object that can be `.perform()`ed
```

There's actually an even nicer syntax that's on the horizon, but
is NOT YET SUPPORTED due to a [Babel bug](https://github.com/babel/babylon/issues/13).

See the [**TypeScript**](#typescript) section to see it in action.

When this Babel issue is addressed, this syntax should Just Work with
this addon.

##### Classic ("Ember object model") syntax with decorators

While still supported through [`transform-decorators-legacy`](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy),
we *do not* recommend using decorators with the Ember object model, since the
[revised version of the decorators proposal](https://github.com/tc39/proposal-decorators)
only allows decorators for classes. This means that, when it advances to
[stage 3](https://github.com/tc39/proposals#stage-3) and
[Babel 7](https://babeljs.io/docs/plugins/transform-decorators/) is released,
support for decorating objects (as opposed to classes) will fade away very soon.

The [`ember-decorators`](https://ember-decorators.github.io/ember-decorators/latest/)
project also [decided to drop support for objects](https://ember-decorators.github.io/ember-decorators/latest/docs/why-go-native).

```js
import Component from '@ember/component';
import { restartableTask } from 'ember-concurrency-decorators';

export default Component.extend({
  @restartableTask
  doStuff: function*() {
    // ...
  }
});

// elsewhere:
this.get('doStuff').perform();
// `doStuff` is still a Task object that can be `.perform()`ed
```

#### TypeScript

TypeScript users can just use native ES6 class syntax with decorators.

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
this.get('doStuff').perform();
// `doStuff` is still a Task object that can be `.perform()`ed
```


## Installation

You'll probably have an easier time setting things up by upgrading to
Babel 6 and `ember-cli@2.13+` first. I'm not sure how to make it work
for older Babel (maybe it can't?).

Once you've done that:

```
ember install ember-concurrency-decorators
```

## Working on this repo

* `git clone <repository-url>` this repository
* `cd ember-concurrency-decorators`
* `yarn install`

### Linting

* `yarn run lint:js`
* `yarn run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## License

This project is licensed under the [MIT License](LICENSE.md).
