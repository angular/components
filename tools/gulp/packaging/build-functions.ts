import {join} from 'path';
import {createRollupBundle} from './rollup-helper';
import {inlinePackageMetadataFiles} from './inline-resources';
import {transpileFile} from './ts-compiler';
import {ScriptTarget, ModuleKind} from 'typescript';
import {DIST_BUNDLES, DIST_ROOT, SOURCE_ROOT, PROJECT_ROOT} from '../constants';
import {copyFiles} from '../util/copy-files';
import {
  addPureAnnotationsToFile, createMetadataFile, createTypingFile, remapSourcemap, uglifyFile,
  updatePackageVersion
} from './build-utils';

// There are no type definitions available for these imports.
const uglify = require('uglify-js');
const sorcery = require('sorcery');

/**
 * Copies different output files into a folder structure that follows the `angular/angular`
 * release folder structure. The output will also contain a README and the according package.json
 * file. Additionally the package will be Closure Compiler and AOT compatible.
 */
export function composeRelease(packageName: string) {
  // To avoid refactoring of the project the package material will map to the source path `lib/`.
  const sourcePath = join(SOURCE_ROOT, packageName === 'material' ? 'lib' : packageName);
  const packagePath = join(DIST_ROOT, 'packages', packageName);
  const releasePath = join(DIST_ROOT, 'releases', packageName);

  inlinePackageMetadataFiles(packagePath);

  copyFiles(packagePath, '**/*.+(d.ts|metadata.json)', join(releasePath, 'typings'));
  copyFiles(DIST_BUNDLES, `${packageName}.umd?(.min).js?(.map)`, join(releasePath, 'bundles'));
  copyFiles(DIST_BUNDLES, `${packageName}?(.es5).js?(.map)`, join(releasePath, '@angular'));
  copyFiles(PROJECT_ROOT, 'LICENSE', releasePath);
  copyFiles(SOURCE_ROOT, 'README.md', releasePath);
  copyFiles(sourcePath, 'package.json', releasePath);

  updatePackageVersion(releasePath);
  createTypingFile(releasePath, packageName);
  createMetadataFile(releasePath, packageName);
  addPureAnnotationsToFile(join(releasePath, '@angular', `${packageName}.es5.js`));
}

/** Builds the bundles for the specified package. */
export async function buildPackageBundles(entryFile: string, packageName: string) {
  const moduleName = `ng.${packageName}`;

  // List of paths to the package bundles.
  const fesm2015File = join(DIST_BUNDLES, `${packageName}.js`);
  const fesm2014File = join(DIST_BUNDLES, `${packageName}.es5.js`);
  const umdFile = join(DIST_BUNDLES, `${packageName}.umd.js`);
  const umdMinFile = join(DIST_BUNDLES, `${packageName}.umd.min.js`);

  // Build FESM-2015 bundle file.
  await createRollupBundle({
    moduleName: moduleName,
    entry: entryFile,
    dest: fesm2015File,
    format: 'es',
  });

  await remapSourcemap(fesm2015File);

  // Downlevel FESM-2015 file to ES5.
  transpileFile(fesm2015File, fesm2014File, {
    target: ScriptTarget.ES5,
    module: ModuleKind.ES2015,
    allowJs: true
  });

  await remapSourcemap(fesm2014File);

  // Create UMD bundle of FESM-2014 output.
  await createRollupBundle({
    moduleName: moduleName,
    entry: fesm2014File,
    dest: umdFile,
    format: 'umd'
  });

  await remapSourcemap(umdFile);

  // Create a minified UMD bundle using UglifyJS
  uglifyFile(umdFile, umdMinFile);

  await remapSourcemap(umdMinFile);
}
