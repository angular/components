#!/bin/bash

set -e


function prep() {
  echo ">>> Preparing node_modules"
  chmod -R u+w node_modules/@angular
  rm -rf node_modules/@angular/*
}

function buildNgPackages() {
  ngDir=$1
  echo ">>> Building @angular packages (from $ngDir)"
  pushd $ngDir
  bazel build --define=compile=local //packages/{animations,common,compiler,compiler-cli,core,elements,forms,platform-browser,platform-browser-dynamic,router,upgrade}:npm_package
  outputPath=`bazel info 2>&1 | grep output_path | cut -d ':' -f 2 | cut -c 2-`/darwin-fastbuild/bin/packages
  popd
}

function installNgPackage() {
  name=$1
  echo "    @angular/$name"
  cp -r $outputPath/$name/npm_package node_modules/@angular/$name
}

function buildPackage() {
  name=$1
  echo "    $name"
  
  # First, fix the build definition.
  # Update the tsconfig to compile from index.ts instead of public-api.ts, and turn on Ivy options.
  node scripts/ivy/fix-tsconfig.js src/$name/tsconfig-build.json

  # If no index.ts exists, rename public-api.ts.
  if [ ! -f src/$name/index.ts -a -f src/$name/public-api.ts ]
  then
    mv src/$name/public-api.ts src/$name/index.ts
  fi

  node_modules/.bin/ngc -p src/$name/tsconfig-build.json
}

if [ "$1" != "" ]
then
  prep
  buildNgPackages $1

  echo ">>> Installing @angular packages"
  installNgPackage "animations"
  installNgPackage "common"
  installNgPackage "compiler"
  installNgPackage "compiler-cli"
  installNgPackage "core"
  installNgPackage "elements"
  installNgPackage "forms"
  installNgPackage "platform-browser"
  installNgPackage "platform-browser-dynamic"
  installNgPackage "router"
  installNgPackage "upgrade"

  chmod -R u+w node_modules/@angular
else
  echo "Usage: $0 /path/to/angular/repo"
fi
