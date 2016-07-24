#!/usr/bin/env node

'use strict';

/*
 * This script creates a bundle of all components and publishes it to Firebase.
 * The bundle will be used to load a Plunker Demo of Angular Material 2.
 */

const spawn = require('child_process').spawnSync;
const exec = require('child_process').execSync;
const glob = require('glob').sync;
const firebase = require('firebase-tools');
const path = require('path');
const fse = require('fs-extra');
const inlineResources = require('../../tools/inline-resources-tools');

const ROOT = path.join(__dirname, '..', '..');
const DIST_ROOT = path.join(ROOT, 'dist');
const DEPLOY_ROOT = path.join(DIST_ROOT, 'plunker-deploy/');

const mainFile = path.join(DIST_ROOT, 'main.js');
const latestTag = getLatestTag();
const isRelease = getSHAFromTag(latestTag) === getLatestSHA();
const baseName = isRelease ? latestTag : 'HEAD';

// Remove the distribution folder.
fse.removeSync(DIST_ROOT);

if (!buildProject()) {
  console.error("An error occurred while building the project.");
  process.exit(1);
}

// Inline the resources into the bundle file.
inlineBundle();

// Create distribution folder.
fse.mkdirp(DEPLOY_ROOT);

// Copy the bundle to the deploy folder.
fse.copySync(mainFile, path.join(DEPLOY_ROOT, `${baseName}_bundle.js`));

firebase.deploy({
  firebase: 'material-plunker',
  token: process.env.MATERIAL_FIREBASE_TOKEN,
  public: 'dist/plunker-deploy'
}).then(() => {
  console.log("Firebase: Successfully deployed bundle to firebase.");
  process.exit(0);
}).catch(err => {
  console.error("Firebase: An error occurred while deploying to firebase.");
  console.error(err);
  process.exit(1);
});

function inlineBundle() {
  let filePathFn = (sourceFile) => {
    let sourceFiles = glob(`**/${sourceFile}`, { cwd: DIST_ROOT });
    return path.resolve(DIST_ROOT, sourceFiles[0]);
  };

  executeInline(inlineResources.inlineStyle);
  executeInline(inlineResources.inlineTemplate);

  function executeInline(inlineFn) {
    fse.writeFileSync(mainFile, inlineFn(filePathFn, fse.readFileSync(mainFile).toString()));
  }
}

function buildProject() {
  // Resolve the Angular CLI entry point from the installed node modules.
  var ngBinary = path.join(ROOT, 'node_modules', 'angular-cli', 'bin', 'ng');

  let out = exec(`node ${ngBinary} build -prod`, {
    cwd: ROOT
  }).toString();

  return out.indexOf('successfully') !== -1;
}

function getLatestTag() {
  let latestTagSHA = spawn('git', ['rev-list', '--tags', '--max-count=1']).stdout.toString().trim();
  return spawn('git', ['describe', '--tags', latestTagSHA]).stdout.toString().trim();
}

function getLatestSHA() {
  return spawn('git', ['rev-parse', 'master'])
}

function getSHAFromTag(tag) {
  return spawn('git', ['rev-list', '-1', tag]).stdout.toString().trim();
}