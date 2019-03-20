#!/bin/bash

set -e


function clear_existing_angular_install() {
  echo ">>> clearing existing @angular packages in node_modules"
  chmod -R u+w node_modules/@angular
  rm -rf node_modules/@angular/*
}

function build_angular_packages() {
  angular_repo_dir=$1
  echo ">>> Building @angular packages (from ${angular_repo_dir})"
  pushd ${angular_repo_dir}
  yarn bazel build --config=release --define=compile=aot //packages/{animations,common,compiler,compiler-cli,core,elements,forms,platform-browser,platform-browser-dynamic,router,upgrade}:npm_package
  output_path=$(yarn --silent bazel info bazel-bin 2>/dev/null)/packages
  popd
}

function install_angular_package() {
  name=$1
  echo "    @angular/$name"
  rm -Rf "node_modules/@angular/${name}"
  cp -r "${output_path}/${name}/npm_package" "node_modules/@angular/${name}"
}


if [[ "$1" != "" ]]
then
  clear_existing_angular_install
  build_angular_packages $1

  echo ">>> Installing @angular packages"
  install_angular_package "animations"
  install_angular_package "common"
  install_angular_package "compiler"
  install_angular_package "compiler-cli"
  install_angular_package "core"
  install_angular_package "elements"
  install_angular_package "forms"
  install_angular_package "platform-browser"
  install_angular_package "platform-browser-dynamic"
  install_angular_package "router"
  install_angular_package "upgrade"

  chmod -R u+w node_modules/@angular
else
  echo "Usage: $0 /path/to/angular/repo"
fi
