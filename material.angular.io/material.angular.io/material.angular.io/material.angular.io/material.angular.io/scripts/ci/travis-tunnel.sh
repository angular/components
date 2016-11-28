#!/bin/bash

start_tunnel() {
  case "$MODE" in

    e2e|saucelabs*)
      ./scripts/saucelabs/start-tunnel.sh
    ;;

    browserstack*)
      ./scripts/browserstack/start-tunnel.sh
    ;;

  esac
}

wait_for_tunnel() {
  case "$MODE" in

    e2e|saucelabs*)
      ./scripts/saucelabs/block-tunnel.sh
    ;;

    browserstack*)
      ./scripts/browserstack/block-tunnel.sh
    ;;

  esac

  sleep 10
}

teardown_tunnel() {
  case "$MODE" in

    e2e|saucelabs*)
      ./scripts/saucelabs/teardown-tunnel.sh
    ;;

    browserstack*)
      ./scripts/browserstack/teardown-tunnel.sh
    ;;

  esac
}
