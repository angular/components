#!/bin/bash

# Script to publish the build artifacts to a GitHub repository.
# Builds will be automatically published once new changes are made to the repository.

# Go to the project root directory
cd $(dirname $0)/../..

build_dir="dist/@angular/material"
build_version=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' package.json)

commit_sha=$(git rev-parse --short HEAD)
commit_author=$(git --no-pager show -s --format='%an <%ae>' HEAD)
commit_message=$(git log --oneline | head -n1)

repo_name="material-builds"
repo_url="http://github.com/DevVersion/material-builds.git"
repo_dir="tmp/$repo_name"

# Create a release of the current repository.
$(npm bin)/gulp build:release

# Prepare cloning the builds repository
rm -rf $repo_dir
mkdir -p $repo_dir

# Clone the repository
git clone $repo_url $repo_dir

# Copy the build files to the repository
rm -rf $repo_dir/*
cp -r $build_dir/* $repo_dir

# Create the build commit and push the changes to the repository.
cd $repo_dir &&

# Setup the git repository authentication.
git config credential.helper "store --file=.git/credentials" &&
echo "$MATERIAL2_BUILDS_TOKEN" > .git/credentials

git add -A &&
git commit -m "$commit_message" --author "$commit_author" &&
git tag "$build_version-$commit_sha" &&
git push origin master --tags

echo "Finished publishing build artifacts"
