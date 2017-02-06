#!/usr/bin/env bash
echo "Highlighting example sources. This may take 15 - 20 seconds..."

examplesSourcePath=./src/examples-highlights
baseExamplesFolder=./src/examples
highlightTool=./tools/code-highlight/syntax-highlight.js

if [ ! -d $examplesSourcePath ];
then
  mkdir $examplesSourcePath
fi

find $baseExamplesFolder -mindepth 2 -type f \( -name "*.css" -or -iname "*.ts" -or -iname "*.html" \) | xargs -P 30 -I {} $highlightTool {} $examplesSourcePath
