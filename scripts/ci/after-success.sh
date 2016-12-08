#!/bin/bash

# Go to the project root directory
cd $(dirname $0)/../..

RESULT=`$(npm bin)/travis-after-modes`


echo "Result: $RESULT"

if [ "$RESULT" = "PASSED" ]; then
  echo "Everything passed"
else
  echo "Something failed"
fi