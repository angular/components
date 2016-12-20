#!/usr/bin/env bash
find ./src/app/examples/ -type f -mindepth 2 -exec sh -c './tools/syntax-highlight.js {} ./src/assets/examples/$(basename {}).html' \;
