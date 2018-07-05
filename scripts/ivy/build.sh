#!/bin/bash

set -e

outputPath=""
updateAngular=""
skipCdk=0

for i in "$@"
do
  case $i in
    --update-angular=*)
    eval updateAngular="${i#*=}"
    shift
    ;;

    --skip-cdk)
    skipCdk=1
    shift
    ;;

    *)
    ;;
  esac
done

function prep() {
  echo ">>> Preparing node_modules"
  chmod -R u+w node_modules/@angular
  rm -rf node_modules/@angular/*
}

function buildNgPackages() {
  ngDir=$1
  echo ">>> Building @angular packages (from $ngDir)"
  pushd $ngDir
  bazel build --define=compile=local //packages/{animations,core,common,compiler,compiler-cli,forms,platform-browser}:npm_package
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
  if [ ! -f src/$name/index.ts ]
  then
    mv src/$name/public-api.ts src/$name/index.ts
  fi

  node_modules/.bin/ngc -p src/$name/tsconfig-build.json
}

if [ "$updateAngular" != "" ]
then
  prep
  buildNgPackages $updateAngular

  echo ">>> Installing @angular packages"
  installNgPackage "animations"
  installNgPackage "common"
  installNgPackage "compiler"
  installNgPackage "compiler-cli"
  installNgPackage "core"
  installNgPackage "forms"
  installNgPackage "platform-browser"

  chmod -R u+w node_modules/@angular
fi

if [ $skipCdk -eq 0 ]
then
  echo ">>> Building the CDK..."
  rm -rf dist/packages/cdk

  buildPackage cdk
  buildPackage cdk/coercion
  buildPackage cdk/platform
  buildPackage cdk/keycodes
  buildPackage cdk/observers
  buildPackage cdk/a11y
  buildPackage cdk/bidi
  buildPackage cdk/scrolling
  buildPackage cdk/portal
  buildPackage cdk/overlay
  buildPackage cdk/collections
  buildPackage cdk/accordion
  buildPackage cdk/layout
  buildPackage cdk/stepper
  buildPackage cdk/text-field
  buildPackage cdk/table
  buildPackage cdk/tree
fi


echo ">>> Building Material..."
rm -rf dist/packages/material
buildPackage lib/core
buildPackage lib/button
buildPackage lib/button-toggle
buildPackage lib/card
buildPackage lib/badge
buildPackage lib/checkbox
buildPackage lib/form-field
buildPackage lib/chips
buildPackage lib/dialog
buildPackage lib/input
buildPackage lib/datepicker
buildPackage lib/divider
buildPackage lib/expansion
buildPackage lib/grid-list
buildPackage lib/icon
buildPackage lib/list
buildPackage lib/menu
buildPackage lib/select
buildPackage lib/tooltip
buildPackage lib/paginator
buildPackage lib/progress-bar
buildPackage lib/progress-spinner
buildPackage lib/radio
buildPackage lib/sidenav
buildPackage lib/slide-toggle
buildPackage lib/slider
buildPackage lib/snack-bar
buildPackage lib/sort
buildPackage lib/stepper
buildPackage lib/table
buildPackage lib/tabs
buildPackage lib/toolbar
buildPackage lib/tree
