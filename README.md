# ember-concurrency-decorators

## EXPERIMENTAL

Babel support for decorator syntax has been fidgety, so expect a bit
of a bumpy ride. Also, the API of this addon is still pre-Alpha.
Probably don't use this in prod code.

## Overview

This Ember Addon let's you use the
[decorator syntax](https://github.com/tc39/proposal-decorators)
for declaring/configuring
[ember-concurrency](https://ember-concurrency.com) tasks.

Classic syntax (without decorators):

```js
import { task } from 'ember-concurrency';
export default Ember.Component.extend({
  doStuff: task(function * () {
    // ...
  }).restartable()
});

// elsewhere:
this.get('doStuff').perform();
```

With decorator syntax

```js
import { restartableTask } from 'ember-concurrency-decorators';
export default Ember.Component.extend({
  @restartableTask
  doStuff: function * () {
    // ...
  }
});

// elsewhere:
this.get('doStuff').perform();
// `doStuff` is still a Task object that can be `.perform()`ed
```

There's actually an even nicer syntax that's on the horizon, but
is NOT YET SUPPORTED due to a [Babel bug](https://github.com/babel/babylon/issues/13).

```js
export default Ember.Component.extend({
  // THIS SYNTAX IS NOT YET SUPPORTED, BUT SOON!
  @restartableTask
  *doStuff() {
    // ...
  }
});
```

When this Babel issue is addressed, this syntax should Just Work with
this addon.

Check out this [weaksauce
test](https://github.com/machty/ember-concurrency-decorators/blob/master/tests/unit/decorators-test.js#L20) to see all the decorators you can use.

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

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `yarn test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
