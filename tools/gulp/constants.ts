import {join} from 'path';

export const PROJECT_ROOT = join(__dirname, '../..');
export const SOURCE_ROOT = join(PROJECT_ROOT, 'src');

export const DIST_ROOT = join(PROJECT_ROOT, 'dist');
export const DIST_COMPONENTS_ROOT = join(DIST_ROOT, '@angular/material');

export const DIST_BUNDLES_ROOT = join(DIST_ROOT, 'bundles');
export const DIST_BUNDLES_OUTPUT_FILE = join(DIST_BUNDLES_ROOT, 'components.bundle.js');

export const PLUNKER_FIREBASE_NAME = 'material2-plnkr';
export const PLUNKER_FIREBASE_TOKEN = process.env['MATERIAL2_PLNKR_TOKEN'];

export const NPM_VENDOR_FILES = [
  '@angular', 'core-js/client', 'hammerjs', 'rxjs', 'systemjs/dist', 'zone.js/dist'
];
