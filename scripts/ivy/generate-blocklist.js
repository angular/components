#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const karmaOutput = JSON.parse(fs.readFileSync('/tmp/karma-result.json'));


let generatedBlocklist = {};
for (const desc of Object.keys(karmaOutput)) {
  generatedBlocklist = {...generatedBlocklist, ...getFullFailure(karmaOutput[desc], desc)};
}

// We want to "remember" the notes from the current blocklist on angular/angular unless the
// error message has changed. We need to know where the local angular/angular repo is.
const angularRepoPath = process.argv[2];
if (!angularRepoPath) {
  console.error('Please provide the path to your local angular/angular repo as the first argument');
  process.exit(1);
}

// Read the contents of the previous blocklist.
const previousBlocklistPath =
     path.join(angularRepoPath, 'tools', 'material-ci', 'angular_material_test_blocklist.js');
const previousBlocklistContent = fs.readFileSync(previousBlocklistPath, 'utf-8');

// Because the blocklist is a javascript file meant to be executed, we just actually execute it with
// eval. Create a dummy `window` for it to add to.
const window = {};
eval(previousBlocklistContent);
const previousBlocklist = window.testBlocklist;

// Copy any existing test notes.
for (const testName of Object.keys(generatedBlocklist)) {
  if (previousBlocklist[testName] &&
      generatedBlocklist[testName].error === previousBlocklist[testName].error) {
    generatedBlocklist[testName].notes = previousBlocklist[testName].notes;
  }
}

// Format the output as an executable javascript program.
const output =
`/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Blocklist of unit tests from angular/material2 with ivy that are skipped when running on
 * angular/angular. As bugs are resolved, items should be removed from this blocklist.
 *
 * The \`notes\` section should be used to keep track of specific issues associated with the failures.
 */

// clang-format off
// tslint:disable

window.testBlocklist = ${JSON.stringify(generatedBlocklist, null, 2)};
// clang-format on`;

// Write that sucker to dist.
fs.writeFileSync('dist/angular_material_test_blocklist.js', output, 'utf-8');


/**
 * Given a karma test result, get a blocklist entry in the form
 * {[full test name]: {error: '...', notes: '...'}}
 */
function getFullFailure(result, fullName = '') {
  if (result['log']) {
    if (result['log'].length) {
      return {[fullName]: {
        error: result['log'][0].split('\n')[0],
        notes: 'Unknown',
      }};
    }

    return {};
  }

  let failures = {};
  for (const key of Object.keys(result)) {
    failures = {...failures, ...getFullFailure(result[key], fullName + ' ' + key)};
  }

  return failures;
}
