#!/bin/bash

# Script which always runs when the current Travis mode succeeds.
# Used to run the travis-after-modes script, which checks if all other modes finished.

# Go to the project root directory
cd $(dirname $0)/../..

npm_binaries=$(npm bin)
ci_result=$($npm_binaries/travis-after-modes)

if [ "$ci_result" = "PASSED" ] && [ -z "$TRAVIS_PULL_REQUEST" ]; then
  echo "All travis modes passed. Publishing the build artifacts..."
  ./scripts/release/publish-build-artifacts.sh
fi