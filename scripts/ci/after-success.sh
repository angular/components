#!/bin/bash

# Go to the project root directory
cd $(dirname $0)/../..

# Download and run the Travis After All script to retrieve information about other build modes.
curl -Lo travis_after_all.py https://raw.github.com/dmakhno/travis_after_all/master/travis_after_all.py
python travis_after_all.py

if [ "$BUILD_LEADER" = "YES" ] && [ "$BUILD_AGGREGATE_STATUS" = "others_succeeded" ]; then

  echo "All other builds succeeded. Publishing build"
  # ./scripts/release/publish-build-artifacts.sh
fi