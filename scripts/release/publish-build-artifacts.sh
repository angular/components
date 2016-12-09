#!/bin/bash

# Go to the project root directory
cd $(dirname $0)/../..

BUILD_DIR="dist/@angular/material"
BUILD_VERSION=`sed -nE 's/^\s*"version": "(.*?)",$/\1/p' package.json`

COMMIT_SHA=`git rev-parse --short HEAD`
COMMIT_AUTHOR=`git --no-pager show -s --format='%an <%ae>' HEAD`
COMMIT_MESSAGE=`git log --oneline | head -n1`

REPO_NAME="material-builds"
REPO_URL="http://github.com/DevVersion/material-builds.git"
REPO_DIR="tmp/$REPO_NAME"

# Create a release of the current repository.
$(npm bin)/gulp build:release

# Prepare cloning the builds repository
rm -rf $REPO_DIR
mkdir -p $REPO_DIR

# Clone the repository
git clone $REPO_URL $REPO_DIR

# Copy the build files to the repository
rm -rf $REPO_DIR/*
cp -r $BUILD_DIR/* $REPO_DIR

# Create the build commit and push the changes to the repository.
cd $REPO_DIR &&

# Setup the git repository authentication.
git config credential.helper "store --file=.git/credentials" &&
echo "$MATERIAL2_BUILDS_TOKEN" > .git/credentials

git add -A &&
git commit -m "$COMMIT_MESSAGE" --author "$COMMIT_AUTHOR" &&
git tag "$BUILD_VERSION-$COMMIT_SHA" &&
git push origin master --tags

echo "Finished publishing build artifacts"
