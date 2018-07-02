/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * This script updates a tsconfig-build.json file for Ivy compilation. It has 3 main goals:
 *
 * 1. Change "public-api.ts" to "index.ts" in the files array.
 * 2. Add "enableIvy": "ngtsc" to "angularCompilerOptions".
 * 3. Turn "annotateForClosureCompiler" off (so decorators will tree-shake properly).
 */

const fs = require('fs');

function replacePublicApiTs(file) {
  if (file === 'public-api.ts') {
    return 'index.ts';
  } else {
    return file;
  }
}


// Read in the tsconfig json file.
let source = fs.readFileSync(process.argv[2], 'utf8')
  .split(/\n/)
  .filter(line => !line.trim().startsWith('/') && !line.trim().startsWith('*'))
  .join('\n')
  .replace(/,(\s+)]/g, '$1]')
  .replace(/,(\s+)}/g, '$1}');

let json = null;
try {
  json = JSON.parse(source);
} catch (e) {
  console.error(`Error parsing tsconfig ${process.argv[2]}:`);
  console.error(source);
  console.error(`Error was:`, e);
  process.exit(1);
}

if (json['files'] && Array.isArray(json['files'])) {
  json['files'] = json['files'].map(replacePublicApiTs);
}

if (json['angularCompilerOptions']) {
  if (json['angularCompilerOptions']['annotateForClosureCompiler']) {
    delete json['angularCompilerOptions']['annotateForClosureCompiler']
  }
  json['angularCompilerOptions']['enableIvy'] = 'ngtsc';
}

fs.writeFileSync(process.argv[2], JSON.stringify(json, null, 2));
