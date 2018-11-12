/**
 * Script that will be used by the markdown_to_html Bazel rule in order to transform
 * multiple markdown files into the equivalent HTML output.
 */

import {readFileSync, writeFileSync} from 'fs';

// These types lack type definitions.
const marked = require('marked');
const highlightJs = require('highlight.js');

// Setup the default options for converting markdown to HTML.
marked.setOptions({
  // Implement a highlight function that converts the code block into a highlighted
  // HTML snippet that uses HighlightJS.
  highlight: (code: string, language: string): string => {
    if (language) {
      return highlightJs.highlight(
          language.toLowerCase() === 'ts' ? 'typescript' : language, code).value;
    }
    return code;
  }
});

if (require.main === module) {
  // The script expects the input files to be specified in the following format:
  //    {input_file_path}={output_file_path}
  // We have to know the output paths because the input path and output path differ
  // fundamentally within the Bazel sandbox.
  const inputFiles = process.argv.slice(2).map(argument => argument.split('='));

  // Walk through each input file and write transformed markdown output to the specified
  // output path.
  inputFiles.forEach(([inputPath, outputPath]) => {
    writeFileSync(outputPath, marked(readFileSync(inputPath, 'utf8')));
  });
}
