#!/bin/bash

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

# Copy Packages
mkdir -p ./node_modules/@angular/material-examples
cp -r ${baseSrcPath}/dist/releases/material-examples ./node_modules/@angular/

# Copy Examples
cp -r ${baseSrcPath}/dist/docs/examples ${baseTargetPath}

# Copy API Files
cp -r ${baseSrcPath}/dist/docs/api ${baseTargetPath}/documents

# Copy Guide files
mkdir -p ./src/assets/documents/guides
cp ${baseSrcPath}/dist/docs/markdown/*.html ${baseTargetPath}/documents/guides

# Copy Overview
mkdir -p ./src/assets/documents/overview
cp ${baseSrcPath}/dist/docs/markdown/*/*.html ${baseTargetPath}/documents/overview
