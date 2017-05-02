import {LICENSE_BANNER, COMPONENTS_DIR} from '../constants';
import {sync as glob} from 'glob';
import {basename, dirname} from 'path';

// There are no type definitions available for these imports.
const rollup = require('rollup');

/** Resolves all sub packages for the material package. */
const materialSubPackages = glob('*/', {cwd: COMPONENTS_DIR})
  .map(packagePath => basename(packagePath))
  .reduce((map: any, packageName: string) => {
    map[`@angular/material/${packageName}`] = `ng.material.${packageName}`;
    return map;
  }, {});

export const ROLLUP_GLOBALS = {
  // Angular dependencies
  '@angular/animations': 'ng.animations',
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  '@angular/forms': 'ng.forms',
  '@angular/http': 'ng.http',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
  '@angular/platform-browser/animations': 'ng.platformBrowser.animations',

  // Local Angular packages inside of Material.
  '@angular/material': 'ng.material',
  '@angular/cdk': 'ng.cdk',

  // Include all Material sub packages.
  ...materialSubPackages,

  // Rxjs dependencies
  'rxjs/Subject': 'Rx',
  'rxjs/add/observable/fromEvent': 'Rx.Observable',
  'rxjs/add/observable/forkJoin': 'Rx.Observable',
  'rxjs/add/observable/of': 'Rx.Observable',
  'rxjs/add/observable/merge': 'Rx.Observable',
  'rxjs/add/observable/throw': 'Rx.Observable',
  'rxjs/add/operator/auditTime': 'Rx.Observable.prototype',
  'rxjs/add/operator/toPromise': 'Rx.Observable.prototype',
  'rxjs/add/operator/map': 'Rx.Observable.prototype',
  'rxjs/add/operator/filter': 'Rx.Observable.prototype',
  'rxjs/add/operator/do': 'Rx.Observable.prototype',
  'rxjs/add/operator/share': 'Rx.Observable.prototype',
  'rxjs/add/operator/finally': 'Rx.Observable.prototype',
  'rxjs/add/operator/catch': 'Rx.Observable.prototype',
  'rxjs/add/operator/first': 'Rx.Observable.prototype',
  'rxjs/add/operator/startWith': 'Rx.Observable.prototype',
  'rxjs/add/operator/switchMap': 'Rx.Observable.prototype',
  'rxjs/Observable': 'Rx'
};

/** Modules that will be treated as external dependencies. Those won't be included in the bundle. */
export const ROLLUP_EXTERNALS = Object.keys(ROLLUP_GLOBALS);

export type BundleConfig = {
  entry: string;
  dest: string;
  format: string;
  moduleName: string;
};

/** Creates a rollup bundles of the Material components.*/
export function createRollupBundle(config: BundleConfig): Promise<any> {
  let bundleOptions = {
    context: 'this',
    entry: config.entry,
    external: isExternalImport,
    paths: rewriteConvertedImports
  };

  let writeOptions = {
    // Keep the moduleId empty because we don't want to force developers to a specific moduleId.
    moduleId: '',
    moduleName: config.moduleName || 'ng.material',
    banner: LICENSE_BANNER,
    format: config.format,
    dest: config.dest,
    globals: ROLLUP_GLOBALS,
    sourceMap: true
  };

  return rollup.rollup(bundleOptions).then((bundle: any) => bundle.write(writeOptions));
}

/**
 * Function that will be used by rollup to detect imports that should be treated as external
 * dependencies. This function also ignores the import shorthands from the NGC (tsickle)
 **/
function isExternalImport(moduleId: string): boolean {
  return ROLLUP_EXTERNALS.indexOf(rewriteConvertedImports(moduleId)) !== -1;
}

/**
 * When compiling with @angular/tsc-wrapped, shorthand imports will be converted into more
 * explicit paths. This function rewrites all expanded imports to their original import.
 * This is important, because when composing releases, the directories won't be present anymore.
 */
function rewriteConvertedImports(moduleId: string): string {
  if (moduleId.endsWith('index')) {
    const shorthandImport = dirname(moduleId);

    // Only remove the path expansion if it is necessary for recognizing it as an external.
    return ROLLUP_EXTERNALS.indexOf(shorthandImport) !== 1 ? shorthandImport : moduleId;
  }

  return moduleId;
}
