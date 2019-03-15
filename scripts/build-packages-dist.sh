#!/usr/bin/env bash

set -u -e -o pipefail

# Go to project directory.
cd $(dirname ${0})/..

# Either "legacy" (view engine) or "aot" (ivy)
compileMode=${1:-"legacy"}

echo "######################################"
echo "  building Angular Material packages"
echo "  mode: ${compileMode}"
echo "######################################"
echo ""

# Create a temporary file which contains the error output.
tmpErrorLog=$(mktemp)

function _on_error() {
  echo "Building release packages failed. Printing error log:"
  echo ""
  cat ${tmpErrorLog} > /dev/stderr
}

function _on_exit() {
  rm -f ${tmpErrorLog}
}

# Setup traps that print the error output on command failure. Also on exit, the
# temporary error log file should be deleted.
trap _on_error ERR
trap _on_exit EXIT

# Path to the output directory into which we copy the npm packages.
destPath="dist/releases"

# Path to the bazel-bin directory.
bazelBinPath=$(bazel info bazel-bin 2> ${tmpErrorLog})

# List of targets that need to be built, e.g. //src/lib, //src/cdk, etc. Note we need to remove all
# carriage returns because Bazel prints these on Windows. This breaks the Bash array parsing.
targets=$(bazel query --output=label 'attr("tags", "\[.*release-package.*\]", //src/...)' \
  'intersect kind(".*_package", //src/...)' 2> ${tmpErrorLog} | tr -d "\r")

# Use --config=release so that the packages can use the result from the stamping script.
echo "$targets" | xargs bazel build --config=release --define=compile=${compileMode} \
  2> ${tmpErrorLog}

# Delete the distribution directory so that the output is guaranteed to be clean. Re-create
# the empty directory so that we can copy the release packages into it later.
rm -Rf ${destPath}
mkdir -p ${destPath}

dirs=`echo "$targets" | sed -e 's/\/\/src\/\(.*\):npm_package/\1/'`

# Copy the package output for all built NPM packages into the dist directory.
for pkg in ${dirs}; do
  pkgDir="${bazelBinPath}/src/${pkg}/npm_package"
  targetDir="${destPath}/${pkg}"

  # The target directory for the Material package ("lib") should not be called "lib".
  # Until we rename the source directory to "material", we just rename it here.
  if [[ "${pkg}" == "lib" ]]; then
    targetDir="${destPath}/material"
  fi

  if [[ -d ${pkgDir} ]]; then
    echo "> Copying package output to \"${targetDir}\".."
    rm -rf ${targetDir}
    cp -R ${pkgDir} ${targetDir}
    chmod -R u+w ${targetDir}
  fi
done
