#!/usr/bin/env bash

### Pre-renders the app under src/universal-app with platform-server and dumps the
### output to stdout.

# Use the license file as a proxy for determining if we're in the root of the project.
if [ ! -e ./LICENSE ]; then
  echo "This script must be run from the root of the material2 project"
  exit 1
fi

# Build the @angular/material package and copy it into node_modules.
# This is a workaround for https://github.com/angular/angular/issues/12249
rm -rf ./node_modules/@angular/material
gulp material:build-release
cp -r ./dist/releases/material ./node_modules/@angular/

# Compile the kitchen sink app (the generated ngfactories are consumed by the prerender script)
./node_modules/.bin/ngc -p src/universal-app/tsconfig-ngc.json

# Run the prerender script.
# This does not use ts-node because some of the generated ngfactory.ts files are written into a
# directory called "node_modules"; ts-node intentionally will not treat any file inside of a
# "node_modules" directory as TypeScript (with the opinion that node_modules should only contain JS)
tsc -p src/universal-app/tsconfig-prerender.json
node ./src/universal-app/dist/prerender.js
