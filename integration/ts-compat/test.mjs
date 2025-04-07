/**
 * Test script that runs the TypeScript compatibility tests against a specified
 * TypeScript package that is passed through command line. The script is executed
 * by a Bazel `nodejs_test` target and relies on Bazel runfile resolution.
 */

import {runTypeScriptCompatibilityTest} from './helpers.mjs';
import path from 'path';

const [pkgName] = process.argv.slice(2);
if (!pkgName) {
  console.error('No TypeScript package specified. Exiting..');
  process.exit(1);
}

const tscBin = path.resolve(`../../node_modules/${pkgName}/bin/tsc`);

runTypeScriptCompatibilityTest(tscBin).catch(e => {
  console.error(e);
  process.exit(1);
});
