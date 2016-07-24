#!/usr/bin/env node
'use strict';

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const inlineResources = require('../../tools/inline-resources-tools');

/**
 * Simple Promiseify function that takes a Node API and return a version that supports promises.
 * We use promises instead of synchronized functions to make the process less I/O bound and
 * faster. It also simplify the code.
 */
function promiseify(fn) {
  return function() {
    const args = [].slice.call(arguments, 0);
    return new Promise((resolve, reject) => {
      fn.apply(this, args.concat([function (err, value) {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      }]));
    });
  };
}

const readFile = promiseify(fs.readFile);
const writeFile = promiseify(fs.writeFile);

/**
 * For every argument, inline the templates and styles under it and write the new file.
 */
for (let arg of process.argv.slice(2)) {
  if (arg.indexOf('*') < 0) {
    // Argument is a directory target, add glob patterns to include every files.
    arg = path.join(arg, '**', '*');
  }

  const files = glob.sync(arg, {})
    .filter(name => /\.js$/.test(name));  // Matches only JavaScript files.

  // Generate all files content with inlined templates.
  files.forEach(filePath => {
    readFile(filePath, 'utf-8')
      .then(content => inlineResources.inlineTemplate(filePath, content))
      .then(content => inlineResources.inlineStyle(filePath, content))
      .then(content => inlineResources.removeModuleIds(content))
      .then(content => writeFile(filePath, content))
      .catch(err => {
        console.error('An error occured: ', err);
      });
  });

}
