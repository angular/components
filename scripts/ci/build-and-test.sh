#!/usr/bin/env bash
set -ex

echo "=======  Starting build-and-test.sh  ========================================"

# Go to project dir
cd $(dirname $0)/../..

# Include sources.
source scripts/ci/sources/mode.sh
source scripts/ci/sources/tunnel.sh

start_tunnel

wait_for_tunnel
if is_lint; then
  $(npm bin)/gulp ci:lint
  $(npm bin)/gulp ci:forbidden-identifiers
elif is_circular_deps_check; then
  # Build first because madge needs the JavaScript output.
  $(npm bin)/gulp build
  npm run check-circular-deps
elif is_e2e; then
  # Run the e2e tests on the served e2e app.
  echo "Starting e2e tests"
  $(npm bin)/gulp ci:e2e
elif is_extract_metadata; then
  $(npm bin)/gulp ci:extract-metadata
else
  # Unit tests
  $(npm bin)/gulp ci:test
#  npm run build
#
#  karma start test/karma.conf.js --single-run --no-auto-watch --reporters='dots'
fi
teardown_tunnel
