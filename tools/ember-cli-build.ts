/// <reference path="typings/node/node.d.ts" />

import fs = require('fs');
import path = require('path');

const mergeTrees = require('broccoli-merge-trees');
const angular2App = require('angular-cli/lib/broccoli/angular2-app');
const broccoliSass = require('broccoli-sass');
const broccoliAutoprefixer = require('broccoli-autoprefixer');
import {BroccoliTs2DartBuilder} from './broccoli-ts2dart';

const autoprefixerOptions = require('../build/autoprefixer-options');


/** Configure the ember build. */
export function config(defaults) {
  const demoAppCssTree = new broccoliSass(['src/demo-app'],
                                          './demo-app.scss',
                                          'demo-app/demo-app.css');
  const componentCssTree = getComponentsCssTree('src/components/', 'components/');
  const ts2DartTree = getTs2DartBroccoliTree('src/components/', 'components/');
  const angularAppTree = new angular2App(defaults);

  return mergeTrees([
    angularAppTree.toTree(),
    componentCssTree,
    demoAppCssTree,
    ts2DartTree,
  ]);
};


/** Walk a tree of directories and return a list of all directories. */
function walk(dir: string): string[] {
  const dirs = fs.readdirSync(dir)
                 .filter(file => fs.statSync(path.join(dir, file)).isDirectory());
  if (!dirs.length) {
    return [dir];
  }
  return dirs.reduce((previous, current) => {
    return previous.concat(walk(path.join(dir, current)));
  }, [dir]);
}


/** Walk a tree, returning the path of every file that matches the extension. */
function walkFiles(root: string, ext: string): string[] {
  return walk(root)
    .map(current => fs.readdirSync(current)
      .filter(file => path.extname(file) === ext)
      .map(file => path.join(current, file)))
    .reduce((p, c) => p.concat(c), []);
}


/** Gets the broccoli tree for all TS files, and create Dart files for them. */
function getTs2DartBroccoliTree(root: string, destination: string): any[] {
  const trees = walkFiles(root, '.ts')
    .map(fileName => new BroccoliTs2DartBuilder(
      [path.dirname(fileName)],
      path.join('.', path.basename(fileName)),
      path.join(destination,
                fileName.substr(root.length).replace(/\.ts/, '.dart'))));

  return broccoliAutoprefixer(mergeTrees(trees), autoprefixerOptions);
}


/** Gets the broccoli tree for all of the components' CSS. */
function getComponentsCssTree(root: string, destination: string): any[] {
  // Walk through all the subdirectory, find all `.scss` files, replace the root by
  // the destination, and create a broccoliSass instance of each files found.
  const trees = walkFiles(root, '.scss')
    .map(fileName => new broccoliSass(
        [path.dirname(fileName), 'src/core/style'],
        path.join('.', path.basename(fileName)),
        path.join(destination,
                  fileName.substr(root.length).replace(/\.scss$/, '.css'))));

  return broccoliAutoprefixer(mergeTrees(trees), autoprefixerOptions);
}
