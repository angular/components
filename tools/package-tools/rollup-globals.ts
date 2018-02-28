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
  '@angular/material': 'ng.material',
  '@angular/material-examples': 'ng.materialExamples',
  '@angular/material-moment-adapter': 'ng.materialMomentAdapter',

  // Include secondary entry-points of the cdk and material packages
  ...rollupCdkEntryPoints,
  ...rollupMatEntryPoints,

  'rxjs/BehaviorSubject': 'Rx',
  'rxjs/Observable': 'Rx',
  'rxjs/Observer': 'Rx',
  'rxjs/Scheduler': 'Rx',
  'rxjs/Subject': 'Rx',
  'rxjs/Subscriber': 'Rx',
  'rxjs/Subscription': 'Rx',

  'rxjs/observable/combineLatest': 'Rx.Observable',
  'rxjs/observable/defer': 'Rx.Observable',
  'rxjs/observable/empty': 'Rx.Observable',
  'rxjs/observable/forkJoin': 'Rx.Observable',
  'rxjs/observable/fromEvent': 'Rx.Observable',
  'rxjs/observable/fromEventPattern': 'Rx.Observable',
  'rxjs/observable/merge': 'Rx.Observable',
  'rxjs/observable/of': 'Rx.Observable',
  'rxjs/observable/throw': 'Rx.Observable',

  'rxjs/scheduler/animationFrame': 'Rx.Scheduler',

  'rxjs/operators/auditTime': 'Rx.operators',
  'rxjs/operators/catchError': 'Rx.operators',
  'rxjs/operators/combineLatest': 'Rx.operators',
  'rxjs/operators/debounceTime': 'Rx.operators',
  'rxjs/operators/delay': 'Rx.operators',
  'rxjs/operators/filter': 'Rx.operators',
  'rxjs/operators/finalize': 'Rx.operators',
  'rxjs/operators/first': 'Rx.operators',
  'rxjs/operators/map': 'Rx.operators',
  'rxjs/operators/pairwise': 'Rx.operators',
  'rxjs/operators/sampleTime': 'Rx.operators',
  'rxjs/operators/share': 'Rx.operators',
  'rxjs/operators/shareReplay': 'Rx.operators',
  'rxjs/operators/startWith': 'Rx.operators',
  'rxjs/operators/switchMap': 'Rx.operators',
  'rxjs/operators/take': 'Rx.operators',
  'rxjs/operators/takeUntil': 'Rx.operators',
  'rxjs/operators/tap': 'Rx.operators',
};
