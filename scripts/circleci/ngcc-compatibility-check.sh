#!/bin/bash

# This script should fail if one of the individual publish scripts fails.
set -e

packages=""

for f in ./dist/releases/*; do
  if [ -d "$f" ]; then
    packages+=" file:$f"
  fi
done

yarn add $packages
yarn ngcc
