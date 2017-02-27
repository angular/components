#!/bin/bash

# Fetch material2 assets from material2-docs-content repo.


ASSETS_DOCS_PATH=./src/assets/documents/
ASSETS_EXAMPLES_PATH=./src/assets/examples/
DEST_PATH=/tmp/material-assets
DOCS_REPO=https://github.com/DevVersion/material2-docs-content
DOCS_API_PATH=$DEST_PATH/api
DOCS_GUIDES_PATH=$DEST_PATH/guides
DOCS_OVERVIEW_PATH=$DEST_PATH/overview
DOCS_EXAMPLES_PATH=$DEST_PATH/examples/

# create folder structure
if [ ! -d $DEST_PATH ]; then
  mkdir -p $DEST_PATH
fi

if [ ! -d $ASSETS_EXAMPLES_PATH ]; then
  mkdir -p $ASSETS_EXAMPLES_PATH $ASSETS_DOCS_PATH
fi

# Pull assets from repo and remove .git directory
git clone $DOCS_REPO $DEST_PATH
rm -rf $DEST_PATH/.git

# Copy files over to their proper place in src/assets
cp -r $DOCS_API_PATH $DOCS_OVERVIEW_PATH $DOCS_GUIDES_PATH $ASSETS_DOCS_PATH
cp -r $DOCS_EXAMPLES_PATH $ASSETS_EXAMPLES_PATH

# Remove temporary directory
rm -rf $DEST_PATH
