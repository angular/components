#!/usr/bin/env bash
set -xu

# Stages a release by putting everything that should be packaged and released
# into the ./deploy folder. This script should be run from the root of the
# material2 repo.

# Make sure you are not running `ng serve` or `ng build --watch` when running this.


# Clear dist/ and deploy/ so that we guarantee there are no stale artifacts.
rm -rf ./dist
rm -rf ./deploy

# deploy/ serves as a working directory to stage the release.
mkdir deploy

# Start off by building normally.
ng build

## FOR OFFLINE COMPILE

# We need to remove moduleId for the ngc build. We do this by simply commenting out with a
# distinguishing marker and then undoing those lines after we've generated the .metadata.json files.
grep -lr "moduleId:" ./src/ | xargs sed -i 's|moduleId:|//MODULE moduleId:|g'

# Ignore the demo-app CSS using the same, which is easier than moving it to the right place for
# ngc to see it.
grep -lr "styleUrls:" ./src/demo-app | xargs sed -i 's|styleUrls:|//DEMOCSS styleUrls:|g'

# Run tsc directly first so that the output directories match what ngc is expecting (since it's
# different from what the CLI will output for demo-app, which we don't care about).
tsc -p ./src/demo-app

# In order to run code generation (part of ngc), the tool has to be able to find the css files.
# Normally the css files out output (from scss files) into dist. So temporarily move them into
# src/ so that `ngc` can find them. This should be unnecessary once ngc supports setting
# `skipTemplateCodegen` from the command line.
find ./dist/{components,core} -type f -iname "*.css" | sed 's/dist\///' | xargs -n 1 -I % cp dist/% src/%

# Now run ngc to generate the .metadata.json files. We exclude outputting the factories since we
# don't publish those.
# TODO(jelbourn): set --skipTemplateCodegen once it is supported on the command line.
./node_modules/.bin/ngc -p ./src/demo-app

# Restore the moduleIds.
grep -lr "//MODULE " ./src/ | xargs sed -i 's|//MODULE ||g'

# Restore the demo-app css.
grep -lr "//DEMOCSS " ./src/ | xargs sed -i 's|//DEMOCSS ||g'

# Remove the output css files
find ./src -iname "*.css" | xargs rm

# Remove the unnecessary .ngfactory.ts and .css.shim.ts files.
find ./src -type f -iname "*.shim.ts" | xargs rm
find ./src -type f -iname "*.ngfactory.ts" | xargs rm

# At this point, we have all of our .metadata.json files, which is all we care about from ngc.
# Temporarily copy them over to deploy/ so we can cut a clean build.
# Use rsync since we want to preserve the directory structure and `cp --parents` won't work on OSX.
find ./dist/{components,core} -iname "*.metadata.json" | xargs -i rsync -Rq {} ./deploy/

# Wipe away dist and perform a clean build.
rm -rf ./dist
ng build

# Inline the css and html into the component ts files.
npm run inline-resources

# Move the .metadata.json files back to where we want them.
(cd ./deploy ; find ./ -iname "*.metadata.json" | xargs -i rsync -Rq {} ../)

# Clear the deploy/ directory again now that we've pulled the metadata out of it.
rm -rf ./deploy/*

# Copy all components/ to deploy/
cp -R ./dist/components/* ./deploy/

# Copy the core/ directory directly into ./deploy
cp -R ./dist/core/ ./deploy/core/

# Remove test files from deploy/
find ./deploy -iname "*.spec.d.ts" | xargs rm
find ./deploy -iname "*.spec.js" | xargs rm
find ./deploy -iname "*.spec.js.map" | xargs rm

# To test the packages, simply `npm install` the package directories.
