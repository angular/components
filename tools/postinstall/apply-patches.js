/**
 * Script that runs after node modules have been installed (including Bazel managed
 * node modules). This script can be used to apply postinstall patches using commands.
 *
 * Most patches should be done using `patch-package` patches.
 */

const shelljs = require('shelljs');
const path = require('path');

/** Path to the project directory. */
const projectDir = path.join(__dirname, '../..');

main();

async function main() {
  shelljs.set('-e');
  shelljs.cd(projectDir);

  // Apply all patches synchronously.
  try {
    applyPatches();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

function applyPatches() {
  // Similar to the `rxjs` performance improvement below, see:
  // https://github.com/angular/angular/pull/46187.
  shelljs.rm('-rf', ['node_modules/@angular/common/locales']);

  // More info in https://github.com/angular/angular/pull/33786
  shelljs.rm('-rf', [
    'node_modules/rxjs/add/',
    'node_modules/rxjs/observable/',
    'node_modules/rxjs/operator/',
    // rxjs/operators is a public entry point that also contains files to support legacy deep import
    // paths, so we need to preserve index.* and package.json files that are required for module
    // resolution.
    'node_modules/rxjs/operators/!(index.*|package.json)',
    'node_modules/rxjs/scheduler/',
    'node_modules/rxjs/symbol/',
    'node_modules/rxjs/util/',
    'node_modules/rxjs/internal/Rx.d.ts',
    'node_modules/rxjs/AsyncSubject.*',
    'node_modules/rxjs/BehaviorSubject.*',
    'node_modules/rxjs/InnerSubscriber.*',
    'node_modules/rxjs/interfaces.*',
    'node_modules/rxjs/Notification.*',
    'node_modules/rxjs/Observable.*',
    'node_modules/rxjs/Observer.*',
    'node_modules/rxjs/Operator.*',
    'node_modules/rxjs/OuterSubscriber.*',
    'node_modules/rxjs/ReplaySubject.*',
    'node_modules/rxjs/Rx.*',
    'node_modules/rxjs/Scheduler.*',
    'node_modules/rxjs/Subject.*',
    'node_modules/rxjs/SubjectSubscription.*',
    'node_modules/rxjs/Subscriber.*',
    'node_modules/rxjs/Subscription.*',
  ]);
}
