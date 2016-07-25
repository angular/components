#!/usr/bin/env node

'use strict';

/*
 * This script creates a bundle of all components and publishes it to Firebase.
 * The bundle will be used to load a Plunker Demo of Angular Material 2.
 */

const globSync = require('glob').sync;
const spawnSync = require('child_process').spawnSync;
const execSync = require('child_process').execSync;
const firebase = require('firebase-tools');
const path = require('path');
const fse = require('fs-extra');
const inlineResources = require('../../tools/inline-resources-tools');

const ROOT = path.join(__dirname, '..', '..');
const DIST_ROOT = path.join(ROOT, 'dist');
const DEPLOY_ROOT = path.join(DIST_ROOT, 'plunker-deploy/');

const mainFile = path.join(DIST_ROOT, 'main.js');
const latestTag = getLatestTag();
const isRelease = getShaFromTag(latestTag) === getLatestSha();
const baseName = isRelease ? latestTag : 'HEAD';

// Remove the distribution folder.
fse.removeSync(DIST_ROOT);

if (!buildProject()) {
  console.error('An error occurred while building the project.');
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
  console.log('Firebase: Successfully deployed bundle to firebase.');
  process.exit(0);
}).catch(err => {
  console.error('Firebase: An error occurred while deploying to firebase.');
  console.error(err);
  process.exit(1);
});

function inlineBundle() {
  let filePathFn = (sourceFile) => {
    let sourceFiles = globSync(`**/${sourceFile}`, { cwd: DIST_ROOT });
    return path.resolve(DIST_ROOT, sourceFiles[0]);
  };

  executeInline(inlineResources.inlineStyle);
  executeInline(inlineResources.inlineTemplate);

  function executeInline(inlineFn) {
    fse.writeFileSync(mainFile, inlineFn(filePathFn, fse.readFileSync(mainFile).toString()));
  }
}

function buildProject() {
  // Note: We can't use spawnSync here, because on some environments the Angular CLI
  // is not added to the System Paths and is only available in the locals.
  let out = execSync('npm run build:production').toString();

  return out.indexOf('successfully') !== -1;
}

function getLatestTag() {
  let tagSHA = spawnSync('git', ['rev-list', '--tags', '--max-count=1']).stdout.toString().trim();
  return spawnSync('git', ['describe', '--tags', tagSHA]).stdout.toString().trim();
}

function getLatestSha() {
  return spawnSync('git', ['rev-parse', 'master'])
}

function getShaFromTag(tag) {
  return spawnSync('git', ['rev-list', '-1', tag]).stdout.toString().trim();
}