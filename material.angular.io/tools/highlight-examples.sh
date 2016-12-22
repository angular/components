#!/usr/bin/env bash
echo "Highlighting example sources. This may take 15 - 20 seconds..."
find ./src/app/examples/ -mindepth 2 -type f \( -iname "*.css" -or -iname "*.ts" -or -iname "*.html" \) -exec sh -c './tools/syntax-highlight.js {} ./src/assets/examples/' \;
