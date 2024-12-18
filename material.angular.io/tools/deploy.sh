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

PROJECT_ID["v8", "prod"]="v8-material-angular-io"

PROJECT_ID["v9", "prod"]="v9-material-angular-io"

PROJECT_ID["v10", "prod"]="v10-material-angular-io"

PROJECT_ID["v11", "prod"]="v11-material-angular-io"

PROJECT_ID["v12", "prod"]="v12-material-angular-io"

PROJECT_ID["next", "prod"]="beta-angular-material-io"

version=${1:-stable}
mode=${2:-dev}
projectId=${PROJECT_ID[$version, $mode]}

# Prevent deployment if we have a pre-release version, using the cdk
# version as a proxy for all components repo package versions.
cdk_prerelease=$(cat package.json | grep cdk | egrep next\|rc || true)
if [[ "${cdk_prerelease}" ]]; then
  if [[ "${version}" == "stable" && "${mode}" == "prod" ]]; then
    echo "Cannot publish a prerelease version to stable prod"
    exit 1
  fi
fi

echo ""
echo "NOTE: Make sure to refresh the docs-content to match the new version of docs."
echo "      You can pull the docs-content for the new version by updating the"
echo "      \"@angular/components-examples\" in the 'package.json' file."
echo ""

read -rp "Press <ENTER> to continue.."

yarn prod-build
yarn firebase use $projectId
yarn firebase target:clear hosting mat-aio
yarn firebase target:apply hosting mat-aio $projectId
yarn firebase deploy --only hosting:mat-aio
