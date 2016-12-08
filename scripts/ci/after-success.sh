#!/bin/bash

# Go to the project root directory
cd $(dirname $0)/../..

RESULT=`$(npm bin)/travis-after-modes`

if [ "$RESULT" = "PASSED" ]; then
  echo "Everything passed"
else
  echo "Something failed"
fi