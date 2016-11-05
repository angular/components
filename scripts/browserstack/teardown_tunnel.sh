#!/bin/bash

set -e -o pipefail


echo "Shutting down Browserstack tunnel"

# Resolving the PID from the readyfile.
kill $(cat $BROWSER_PROVIDER_READY_FILE)

echo ""
echo "Browserstack tunnel has been shut down"