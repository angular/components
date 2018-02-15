#!/usr/bin/env bash

# Load the retry-call utility function.
source ./scripts/retry-call.sh

# Variable the specifies how often the wait script should be invoked if it fails.
WAIT_RETRIES=2

start_tunnel_if_necessary() {
  case "$MODE" in
    e2e*)
      ./scripts/saucelabs/start-tunnel.sh
      ;;
    test-browserstack-*)
      ./scripts/browserstack/start-tunnel.sh
      ;;
    *)
      ;;
  esac
}

wait_for_tunnel_if_present() {
  case "$MODE" in
    e2e*)
      retryCall ${WAIT_RETRIES} ./scripts/saucelabs/wait-tunnel.sh
      ;;
    test-browserstack-*)
      retryCall ${WAIT_RETRIES} ./scripts/browserstack/wait-tunnel.sh
      ;;
    *)
      ;;
  esac
}

teardown_tunnel_if_present() {
  case "$MODE" in
    e2e*)
      ./scripts/saucelabs/stop-tunnel.sh
      ;;
    test-browserstack-*)
      ./scripts/browserstack/stop-tunnel.sh
      ;;
    *)
      ;;
  esac
}

