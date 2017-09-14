#!/bin/bash

# Go to project directory
cd $(dirname ${0})/..

# Base Source Path
if [ -d ~/material2 ] ; then
  echo "- Using path ~/material2"
  baseSrcPath=~/material2
elif [ -d ../material2 ] ; then
  echo "- Using path ../material2"
  baseSrcPath=../material2
elif [ -d ${MATERIAL2_LOCAL} ] ; then
  echo "- Using MATERIAL2_LOCAL env variable"
  baseSrcPath = ${MATERIAL2_LOCAL}
fi

# Build Docs
(cd ${baseSrcPath} && gulp docs)

# Build Examples
(cd ${baseSrcPath} && gulp material-examples:build-release)

# Base Target Path
baseTargetPath=./src/assets

# Path to all overview HTML files.
overviewHtmlFiles=$(find ${baseSrcPath}/dist/docs/markdown -path "*/*.html" ! -name 'README.*')

# Copy Packages
cp -r ${baseSrcPath}/dist/releases/material-examples ./node_modules/@angular/

# Copy Examples
cp -r ${baseSrcPath}/dist/docs/examples ${baseTargetPath}

# Copy Plunkers
cp -r ${baseSrcPath}/dist/docs/plunker ${baseTargetPath}

# Copy API Files
cp -r ${baseSrcPath}/dist/docs/api ${baseTargetPath}/documents

# Copy Guide files
mkdir -p ./src/assets/documents/guides
cp ${baseSrcPath}/dist/docs/markdown/*.html ${baseTargetPath}/documents/guides

# Copy Overview
mkdir -p ./src/assets/documents/overview
cp ${overviewHtmlFiles} ${baseTargetPath}/documents/overview
