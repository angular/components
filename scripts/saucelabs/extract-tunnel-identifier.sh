#!/usr/bin/env bash

set -e -o pipefail

volatile_status_key="bazel-out/volatile-status.txt"
tunnel_key=$(cat ${volatile_status_key} | { grep SAUCE_TUNNEL_IDENTIFIER || echo ""; })

if [[ -z "${tunnel_key}" ]]; then
  echo "No tunnel identifier set as volatile status key."
  exit 1
fi

echo ${tunnel_key} | cut -f2 -d ' '
