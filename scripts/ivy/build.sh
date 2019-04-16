#!/bin/bash

set -e

distPath="dist/ivy-demo-app"

echo ">>> Build Material"
rm -rf dist
yarn gulp build:devapp

echo ">>> Rebuild dev-app with ngtsc"
node_modules/.bin/ngc -p src/dev-app/tsconfig-build.json

echo ">>> Bundling dev-app with Rollup"
node ./src/dev-app/rollup-bundles.js

echo ">>> Copying assets to output"
cp src/dev-app/index.html ${distPath}
cp dist/packages/dev-app/theme.css ${distPath}
cp 'node_modules/@webcomponents/custom-elements/custom-elements.min.js' ${distPath}
cp node_modules/core-js/client/core.js ${distPath}
cp node_modules/requirejs/require.js ${distPath}
cp node_modules/zone.js/dist/zone.js ${distPath}
cp node_modules/hammerjs/hammer.min.js ${distPath}

echo ">>> Done."
echo "Output: $(pwd)/${distPath}"
echo "Serve the Ivy demo-app with: yarn gulp ivy-serve"
