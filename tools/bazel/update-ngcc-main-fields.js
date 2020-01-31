/**
 * Script that runs after node modules have been installed, and NGCC processed all packages.
 * This script updates the `package.json` files of `@angular` framework packages to point
 * to the NGCC processed UMD bundles. This is needed because we run Angular in a `nodejs_binary`,
 * but want to make sure that Ivy is being used. By default, the NodeJS module resolution will
 * load the unprocessed UMD bundle, so we update the `main` field in `package.json` files to point
 * to the Ivy UMD bundles.
 */

const shelljs = require('shelljs');
const fs = require('fs');

const MAIN_FIELD_NAME = 'main';
const NGCC_MAIN_FIELD_NAME = 'main_ivy_ngcc';

shelljs.find('node_modules/@angular/**/package.json').forEach(filePath => {
  // Do not update `package.json` files for deeply nested node modules (e.g. dependencies of
  // the `@angular/compiler-cli` package).
  if (filePath.lastIndexOf('node_modules/') !== 0) {
    return;
  }
  const parsedJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (parsedJson[NGCC_MAIN_FIELD_NAME] &&
      parsedJson[MAIN_FIELD_NAME] !== parsedJson[NGCC_MAIN_FIELD_NAME]) {
    // Update the main field to point to the ngcc main script.
    parsedJson[MAIN_FIELD_NAME] = parsedJson[NGCC_MAIN_FIELD_NAME];
    fs.writeFileSync(filePath, JSON.stringify(parsedJson, null, 2));
  }
});
