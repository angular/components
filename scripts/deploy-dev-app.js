#!/usr/bin/env node

/**
 * Script that builds the dev-app as a static web package that will be
 * deployed to the currently configured Firebase project.
 */

const {exec, set, cd, cp, rm, chmod} = require('shelljs');
const {join} = require('path');

// ShellJS should throw if any command fails.
set('-e');

/** Path to the project directory. */
const projectDirPath = join(__dirname, '../');

// Go to project directory.
cd(projectDirPath);

/** Path to the bazel-bin directory. */
const bazelBinPath = exec(`pnpm -s bazel info bazel-bin`).stdout.trim();

/** Output path for the Bazel dev-app web package target. */
const webPackagePath = join(bazelBinPath, 'src/dev-app/web_package');

/** Destination path where the web package should be copied to. */
const distPath = join(projectDirPath, 'dist/dev-app-web-pkg');

// Build web package output.
exec('pnpm -s bazel build //src/dev-app:web_package');

// Clear previous deployment artifacts.
rm('-Rf', distPath);

// Copy the web package from the bazel-bin directory to the project dist
// path. This is necessary because the Firebase CLI does not support deployment
// of a public folder outside of the "firebase.json" file.
cp('-R', webPackagePath, distPath);

// Bazel by default marks output files as `readonly` to ensure hermeticity. Since we moved
// these files out of the `bazel-bin` directory, we should make them writable. This is necessary
// so that subsequent runs of this script can delete old contents from the deployment dist folder.
chmod('-R', 'u+w', distPath);

// Run the Firebase CLI to deploy the hosting target.
exec(`pnpm -s firebase deploy --only hosting`);
