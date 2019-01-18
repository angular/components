#!/bin/bash

set -e

# Change directory to project root.
cd $(dirname $0)/../..

# Include sources.
source ./scripts/ci/travis-mode.sh

# Run the specified mode.
if is_lint; then
  npm run lint
elif is_e2e; then
  npm run e2e
elif is_test; then
  npm run build-themes
  npm run test -- --watch false --progress=false
fi
