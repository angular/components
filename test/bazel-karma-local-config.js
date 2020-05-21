/**
 * Karma configuration that is used by Bazel karma_web_test targets which do not
 * want to launch any browser and just enable manual browser debugging.
 */

const bazelKarma = require('@bazel/concatjs');

module.exports = config => {
  const overwrites = {
    // Configure the Karma spec reporter so that spec timing is captured.
    specReporter: {
      showSpecTiming: true,
    }
  };

  // By default "@bazel/concatjs" configures Chrome as browser. Since we don't want
  // to launch any browser at all, we overwrite the "browsers" option. Since the
  // default config tries to extend the browsers array with "Chrome", we need to
  // always return a new empty array.
  Object.defineProperty(overwrites, 'browsers', {
    get: () => [],
    set: () => {},
    enumerable: true
  });

  // Ensures that tests start executing once browsers have been manually connected. We need
  // to use "defineProperty" because the default "@bazel/concatjs" config overwrites the option.
  Object.defineProperty(overwrites, 'autoWatch', {
    get: () => true,
    set: () => {},
    enumerable: true,
  });

  // Setup the Karma spec reporter so that debugging of slow tests is easier.
  // Note that we need to override it using `defineProperty` because otherwise
  // `@bazel/concatjs` always appends the `progress` reporter that causes unreadable
  // console output.
  Object.defineProperty(config, 'reporters', {
    get: () => ['spec'],
    set: () => {},
    enumerable: true,
  });

  // When not running with ibazel, do not set up the `@bazel/concatjs` watcher. This one
  // relies on ibazel to write to the `stdin` interface. When running without ibazel, the
  // watcher will kill concatjs since there is no data written to the `stdin` interface.
  if (process.env['IBAZEL_NOTIFY_CHANGES'] !== 'y') {
    delete bazelKarma['watcher'];
  }

  config.set(overwrites);
};
