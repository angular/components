#!/bin/bash

# Go to the project root directory
cd $(dirname $0)/../..

RESULT=`$(npm bin)/travis-after-modes`

if [ "$RESULT" = "PASSED" ] && [ -z "$TRAVIS_PULL_REQUEST" ]; then
  echo "All travis modes passed. Publishing the build artifacts..."
  ./scripts/release/publish-build-artifacts.sh
fi