#!/bin/bash

set -eu -o pipefail

declare -A PROJECT_ID

# Firebase project ids
PROJECT_ID["stable", "dev"]="material2-docs-dev"
PROJECT_ID["stable", "prod"]="material-angular-io"
PROJECT_ID["stable", "beta"]="beta-angular-material-io"

PROJECT_ID["v5", "dev"]="material-docs-dev-v5"
PROJECT_ID["v5", "prod"]="v5-material-angular-io"

PROJECT_ID["v6", "dev"]="material-docs-dev-v6"
PROJECT_ID["v6", "prod"]="v6-material-angular-io"

PROJECT_ID["v7", "dev"]="material-docs-dev-v7"
PROJECT_ID["v7", "prod"]="v7-material-angular-io"

version=${1:-stable}
mode=${2:-dev}
projectId=${PROJECT_ID[$version, $mode]}

echo ""
echo "NOTE: Make sure to refresh the docs-content to match the new version of docs."
echo "      You can pull the docs-content for the new version by updating the"
echo "      \"@angular/material-examples\" in the 'package.json' file."
echo ""

read -rp "Press <ENTER> to continue.."

yarn prod-build
yarn firebase use $projectId
yarn firebase deploy
