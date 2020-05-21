#!/bin/bash

# In case any command failed, we want to immediately exit the script with the
# proper exit code.
set -e

# Go to project directory.
cd $(dirname ${0})/../..

# Decode access token and make it accessible for child processes.
export SAUCE_ACCESS_KEY=`echo ${SAUCE_ACCESS_KEY} | rev`
export SAUCE_TUNNEL_IDENTIFIER="angular-material-${CIRCLE_BUILD_NUM}-${CIRCLE_NODE_INDEX}"

# Start tunnel and wait for it being ready.
./scripts/saucelabs/start-tunnel.sh &
./scripts/saucelabs/wait-tunnel.sh

TEST_TARGETS=$(yarn -s bazel query --output label 'attr("tags", "saucelabs", //src/...)')

# Run all Saucelabs test targets.
yarn bazel test ${TEST_TARGETS} \
  --workspace_status_command="echo SAUCE_TUNNEL_IDENTIFIER ${SAUCE_TUNNEL_IDENTIFIER}" \
  --stamp \
  --test_env=SAUCE_USERNAME \
  --test_env=SAUCE_ACCESS_KEY \
  --jobs=3

# Kill the Saucelabs tunnel. This is necessary in order to avoid rate-limit
# errors that cause the unit tests to be flaky.
./scripts/saucelabs/stop-tunnel.sh

# Wait for all sub processes to terminate properly.
wait
