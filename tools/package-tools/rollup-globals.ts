import {join} from 'path';
import {getSubdirectoryNames} from './secondary-entry-points';
import {buildConfig} from './build-config';

/** Method that converts dash-case strings to a camel-based string. */
export const dashCaseToCamelCase =
  (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

/** List of potential secondary entry-points for the cdk package. */
const cdkSecondaryEntryPoints = getSubdirectoryNames(join(buildConfig.packagesDir, 'cdk'));

/** List of potential secondary entry-points for the material package. */
const matSecondaryEntryPoints = getSubdirectoryNames(join(buildConfig.packagesDir, 'lib'));

/** Object with all cdk entry points in the format of Rollup globals. */
const rollupCdkEntryPoints = cdkSecondaryEntryPoints.reduce((globals: any, entryPoint: string) => {
  globals[`@angular/cdk/${entryPoint}`] = `ng.cdk.${dashCaseToCamelCase(entryPoint)}`;
  return globals;
}, {});

/** Object with all material entry points in the format of Rollup globals. */
const rollupMatEntryPoints = matSecondaryEntryPoints.reduce((globals: any, entryPoint: string) => {
  globals[`@angular/material/${entryPoint}`] = `ng.material.${dashCaseToCamelCase(entryPoint)}`;
  return globals;
}, {});

/** Map of globals that are used inside of the different packages. */
export const rollupGlobals = {
  'moment': 'moment',
  'tslib': 'tslib',

  '@angular/animations': 'ng.animations',
  '@angular/common': 'ng.common',
  '@angular/common/http': 'ng.common.http',
  '@angular/common/http/testing': 'ng.common.http.testing',
  '@angular/common/testing': 'ng.common.testing',
  '@angular/core': 'ng.core',
  '@angular/core/testing': 'ng.core.testing',
  '@angular/forms': 'ng.forms',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
  '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
  '@angular/platform-server': 'ng.platformServer',
  '@angular/router': 'ng.router',

  // Some packages are not really needed for the UMD bundles, but for the missingRollupGlobals rule.
  '@angular/cdk': 'ng.cdk',
  '@angular/cdk-experimental': 'ng.cdkExperimental',
  '@angular/material': 'ng.material',
  '@angular/material-examples': 'ng.materialExamples',
  '@angular/material-experimental': 'ng.materialExperimental',
  '@angular/material-moment-adapter': 'ng.materialMomentAdapter',

  // Include secondary entry-points of the cdk and material packages
  ...rollupCdkEntryPoints,
  ...rollupMatEntryPoints,

  'rxjs': 'Rx',
  'rxjs/operators': 'Rx.operators',
};
