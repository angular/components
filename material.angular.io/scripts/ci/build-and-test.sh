#!/bin/bash
set -ex

# Change directory to project root.
cd $(dirname $0)/../..

# Include sources.
source ./scripts/ci/travis-mode.sh
source ./scripts/ci/travis-tunnel.sh

# Start and wait for the tunnel to be ready.
start_tunnel
wait_for_tunnel

# Run the specified mode.
if is_lint; then
  $(npm bin)/ng lint
elif is_e2e; then
  $(npm bin)/ng e2e
else
  $(npm bin)/ng test --watch false
fi

# Shutdown the previous created tunnel.
teardown_tunnel