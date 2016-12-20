#!/usr/bin/env node
'use strict';

/**
 * Creates a syntax highlighted HTML file from a source file using highlight.js.
 *
 * Use:
 * syntax-highlight path/to/input/file path/to/output/file
 */

const fs = require('fs');
const path = require('path');
const hljs = require('highlight.js');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

let language = path.extname(inputFile).toLowerCase().slice(1);

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
  fs.writeFile(outputFile, highlighted.value, {encoding: 'utf8'});
});
