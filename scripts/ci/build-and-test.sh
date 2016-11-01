#!/usr/bin/env bash
set -ex

echo "=======  Starting build-and-test.sh  ========================================"

# Go to project dir
cd $(dirname $0)/../..

# Include sources.
source scripts/ci/sources/mode.sh
source scripts/ci/sources/tunnel.sh

if is_lint; then
  $(npm bin)/gulp ci:lint
elif is_e2e; then
  run_in_tunnel "$(npm bin)/gulp ci:e2e"
elif is_extract_metadata; then
  $(npm bin)/gulp ci:extract-metadata
else
  run_in_tunnel "$(npm bin)/gulp ci:test"
fi
