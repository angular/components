import {task} from 'gulp';
import {
  DIST_ROOT, PROJECT_ROOT, DIST_BUNDLES_OUTPUT_FILE, DIST_BUNDLES_ROOT,
  PLUNKER_FIREBASE_NAME, PLUNKER_FIREBASE_TOKEN
} from '../constants';
import * as path from 'path';

const systemjsBuilder = require('systemjs-builder');
const firebase = require('firebase-tools');

const ANGULAR_PACKAGES = [
  '@angular/core/',
  '@angular/common',
  '@angular/compiler',
  '@angular/forms',
  '@angular/http',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
];

task('build:bundle', ['build:components', ':build:devapp:vendor', ':build:devapp:ts'], () => {

  const entryPoints = ANGULAR_PACKAGES.concat('@angular/material');
  const builder = new systemjsBuilder(path.relative(PROJECT_ROOT, DIST_ROOT));

  // Load the SystemJS config of the demo-app, because it already includes all mappings.
  builder.loadConfigSync(path.join(DIST_ROOT, 'system-config.js'));

  // Create a bundle for all specified entry points.
  return builder.bundle(entryPoints.join(' + '), DIST_BUNDLES_OUTPUT_FILE, {
    minify: true,
    sourceMaps: false
  });
});


task('deploy:bundle:plunker', ['build:bundle'], () => {
  return firebase.deploy({
    firebase: PLUNKER_FIREBASE_NAME,
    token: PLUNKER_FIREBASE_TOKEN,
    public: path.relative(PROJECT_ROOT, DIST_BUNDLES_ROOT)
  }).then(() => {
    console.log('Firebase: Successfully deployed bundle to firebase.');
    process.exit(0); // Manually exit the process, because the CLI keeps the process alive.
  }).catch((error: any) => {
    console.error(error.message || error);
    process.exit(1); // Manually exit the process, because the CLI keeps the process alive.
  });
});
