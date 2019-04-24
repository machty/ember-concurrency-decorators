import { begin, end } from '@ember/runloop';

/**
 * Ensures that each test is executed within a RunLoop
 *
 * @param {object} hooks QUnit Hooks
 */
export default function inRunloop(hooks: NestedHooks) {
  hooks.beforeEach(function() {
    begin();
  });

  hooks.afterEach(function() {
    end();
  });
}

/**
 * Ends the current RunLoop and starts a new one
 */
export function next() {
  end();
  begin();
}
