#!/usr/bin/env node

'use strict';

/*
 * The forbidden identifiers script will check for blocked statements and also detect invalid
 * imports of other scope packages.
 *
 * When running against a PR, the script will only analyze the specific amount of commits inside
 * of the Pull Request.
 *
 * By default it checks all source files and fail if any errors were found.
 */

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;

const blocked_statements = [
  '\\bddescribe\\(',
  '\\bfdescribe\\(',
  '\\biit\\(',
  '\\bfit\\(',
  '\\bxdescribe\\(',
  '\\bxit\\(',
  '\\bdebugger;',
  'from \\\'rxjs/Rx\\\'',
];

const SCOPE_PACKAGE = '@angular2-material';
const sourceFolders = ['./src', './e2e'];
const packageFolders = glob('src/lib/*/');
const blockedRegex = new RegExp(blocked_statements.join('|'), 'g');
const importRegex = /from\s+'(.*)';/g;
const importScopes = packageFolders.map(_createScopeFromPath);

/*
 * Verify that the current PR is not adding any forbidden identifiers.
 * Run the forbidden identifiers check against all sources when not verifying a PR.
 */

findTestFiles()

  /* Only match .js or .ts, and remove .d.ts files. */
  .then(files => files.filter(name => /\.(js|ts)$/.test(name) && !/\.d\.ts$/.test(name)))

  /* Read content of the filtered files */
  .then(files => files.map(name => ({ name, content: fs.readFileSync(name, 'utf-8') })))

  /* Run checks against content of the filtered files. */
  .then(diffList => {

    return diffList.reduce((errors, diffFile) => {
      let fileName = diffFile.name;
      let content = diffFile.content.split('\n');
      let lineCount = 0;

      content.forEach(line => {
        lineCount++;

        let matches = line.match(blockedRegex);
        let invalidImport = isInvalidImport(fileName, line);

        if (matches || invalidImport) {

          let error = {
            fileName: fileName,
            lineNumber: lineCount,
            statement: matches && matches[0] || invalidImport.statement
          };

          if (invalidImport) {
            error.messages = [
              invalidImport.deep ?
                'You are using an import statement, which imports a file by using its full path (deep import).' :
                'You are using an import statement, which imports a file from another scope package.'
              ,
              `Please import the file by using the following path: ${invalidImport.corrected}`
            ];
          }

          errors.push(error);
        }
      });

      return errors;

    }, []);
  })

  /* Print the resolved errors to the console */
  .then(errors => {
    if (errors.length > 0) {
      console.error('Error: You are using one or more blocked statements:\n');

      errors.forEach(entry => {
        if (entry.messages) {
          entry.messages.forEach(message => console.error(`   ${message}`))
        }

        console.error(`   ${entry.fileName}@${entry.lineNumber}, Statement: ${entry.statement}.\n`);
      });

      process.exit(1);
    }
  })

  .catch(err => {
    // An error occurred in this script. Output the error and the stack.
    console.error('An error occurred during execution:');
    console.error(err.stack || err);
    process.exit(2);
  });


/**
 * Resolves all files, which should run against the forbidden identifiers check.
 * @return {Promise.<Array.<string>>} Files to be checked.
 */
function findTestFiles() {
  if (process.env['TRAVIS_PULL_REQUEST']) {
    return findChangedFiles();
  }

  var files = sourceFolders.map(folder => {
    return glob(`${folder}/**/*.ts`);
  }).reduce((files, fileSet) => files.concat(fileSet), []);

  return Promise.resolve(files);
}

/**
 * List all the files that have been changed or added in the last commit range.
 * @returns {Promise.<Array.<string>>} Resolves with a list of files that are added or changed.
 */
function findChangedFiles() {
  let commitRange = process.env['TRAVIS_COMMIT_RANGE'];

  return exec(`git diff --name-status ${commitRange} ${sourceFolders.join(' ')}`)
    .then(rawDiff => {
      return rawDiff
        .split('\n')
        .filter(line => {
          // Status: C## => Copied (##% confident)
          //         R## => Renamed (##% confident)
          //         D   => Deleted
          //         M   => Modified
          //         A   => Added
          return line.match(/([CR][0-9]*|[AM])\s+/);
        })
        .map(line => line.split(/\s+/, 2)[1]);
    });
}

/**
 * Checks the line for any relative imports of a scope package, which should be imported by using
 * the scope package name instead of the relative path.
 * @param fileName Filename to validate the path
 * @param line Line to be checked.
 */
function isInvalidImport(fileName, line) {
  let importMatch = importRegex.exec(line);

  // We have to reset the last index of the import regex, otherwise we
  // would have incorrect matches in the next execution.
  importRegex.lastIndex = 0;

  // Skip the check if the current line doesn't match any imports.
  if (!importMatch) {
    return false;
  }

  let importPath = importMatch[1];
  let isMaterialImport = importPath.startsWith(SCOPE_PACKAGE);

  // Skip the check when the import doesn't start with a dot and also is not
  // a Angular Material 2 scope import.
  if (!importPath.startsWith('.') && !isMaterialImport) {
    return false;
  }

  var fromScope = getScopeFromPath(fileName);
  var importScope = null;
  var isInvalid = false;

  /*
   * Resolve from the import statement the associated scope definition and source file path.
   * Also determine whether the import statement is invalid or not.
   */
  if (isMaterialImport) {
    importScope = getScopeFromName(importPath);
    importPath = path.resolve(importScope.path, path.relative(importScope.name, importPath));

    isInvalid = importScope && importPath !== path.resolve(importScope.path);
  } else {
    importPath = path.resolve(path.dirname(fileName), importPath);
    importScope = getScopeFromPath(importPath);

    isInvalid = fromScope && importScope && fromScope.path !== importScope.path;
  }

  if (isInvalid) {
    return {
      fromScope: fromScope,
      importScope: importScope,
      importPath: importPath,
      
      statement: importMatch[0],
      corrected: importScope.name,
      deep: isMaterialImport
    }
  }

}

/**
 * Finds the associated scope definition from an scoped import.
 * @param scopeName
 * @returns {ScopeDef}
 */
function getScopeFromName(scopeName) {
  return importScopes.filter(scope => scopeName.startsWith(scope.name))[0];
}

/**
 * Finds the associated scope definition from an file path.
 * @param filePath
 * @returns {ScopeDef}
 */
function getScopeFromPath(filePath) {
  // Normalize the file path to avoid deviations with the import delimiters.
  filePath = path.normalize(filePath);

  return importScopes.filter(scope => filePath.indexOf(path.normalize(scope.path)) !== -1)[0];
}

/**
 * Creates a scope definition from the specified path.
 * @param scopePath
 * @returns {ScopeDef}
 */
function _createScopeFromPath(scopePath) {

  var scopeBase = path.basename(scopePath);

  /** @typedef {{base: string, path: string, name: string}} ScopeDef */
  return {
    base: scopeBase,
    path: scopePath,
    name: `${SCOPE_PACKAGE}/${scopeBase}`
  }
}

/**
 * Executes a process command and wraps it inside of a promise.
 * @returns {Promise.<String>}
 */
function exec(cmd) {
  return new Promise(function(resolve, reject) {
    child_process.exec(cmd, function(err, stdout /*, stderr */) {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}
