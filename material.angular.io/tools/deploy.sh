#!/bin/bash

set -eu -o pipefail

declare -A PROJECT_ID

# Firebase project ids
PROJECT_ID["stable", "dev"]="material2-docs-dev"
PROJECT_ID["stable", "prod"]="material-angular-io"
PROJECT_ID["stable", "beta"]="beta-angular-material-io"
PROJECT_ID["v5", "dev"]="material2-docs-5"
PROJECT_ID["v5", "prod"]="v5-material-angular-io"
PROJECT_ID["v6", "dev"]="material2-docs-6"
PROJECT_ID["v6", "prod"]="v6-material-angular-io"

version=${1:-stable}
mode=${2:-dev}
projectId=${PROJECT_ID[$version, $mode]}

echo ""
echo "NOTE: Make sure to refresh the docs-content to match the new version of docs."
echo "      You can pull the docs-content for the new version by using the fetch-assets script."
echo ""
echo "      e.g. ./tools/fetch-assets.sh 6.4.x"
echo ""

read -p "Press <ENTER> to continue.."

npm run build-themes

$(npm bin)/ng build --aot --prod --build-optimizer=false
$(npm bin)/firebase use $projectId
$(npm bin)/firebase deploy

