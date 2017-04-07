#!/bin/bash

# Fetch material2 assets from material2-docs-content repo.


# Dir where documentation assets will be copied (overviews, api docs)
docAssetsPath=./src/assets/documents/

# Dir where live-example assets will be copied
exampleAssetsPath=./src/assets/examples/

# Dir where published assets will temporarily copied to (using `git clone`).
tmpAssetClonePath=/tmp/material-assets

# GitHub repo which contains snapshots of the docs content from angular/material2.
docsContentRepo=https://github.com/angular/material2-docs-content

# Dirs for each of api docs, guides, overviews, and live-examples within the
# cloned content repo.
apiPath=$tmpAssetClonePath/api
guidesPath=$tmpAssetClonePath/guides
overviewPath=$tmpAssetClonePath/overview
examplesPath=$tmpAssetClonePath/examples/

# Create folders into which to copy content and assets.
mkdir -p $tmpAssetClonePath
mkdir -p $exampleAssetsPath $docAssetsPath

# Pull assets from repo and remove .git directory
git clone $docsContentRepo $tmpAssetClonePath

# Copy files over to their proper place in src/assets
cp -r $apiPath $overviewPath $guidesPath $docAssetsPath
cp -r $examplesPath $exampleAssetsPath

# Remove temporary directory
rm -rf $tmpAssetClonePath
