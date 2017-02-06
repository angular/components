#!/usr/bin/env node
'use strict';

/**
 * Creates a syntax highlighted HTML file from a source file using highlight.js.
 *
 * Use:
 * syntax-highlight path/to/input/file path/to/output/dir/
 */

const fs = require('fs');
const path = require('path');
const hljs = require('highlight.js');

const inputFile = process.argv[2];
const outputPath = process.argv[3];

let extension = path.extname(inputFile).toLowerCase().slice(1);
let language = extension;

// Highlight.js expects 'typescript' written out instead of 'ts'.
if (language == 'ts') {
  language = 'typescript';
}


fs.readFile(inputFile, 'utf8', (error, content) => {
  if (error) {
    console.error(`Could not read file ${inputFile}`);
    exit(1);
  }

  let highlighted = hljs.highlight(language, content);

  let filename = path.basename(inputFile);
  filename = filename.slice(0, filename.lastIndexOf('.')) + '-' + extension + '.html';
  let outputFile = path.join(outputPath, filename);

  fs.writeFile(outputFile, highlighted.value, {encoding: 'utf8'});
});
