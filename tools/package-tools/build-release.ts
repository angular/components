import {join} from 'path';
import {readFileSync, writeFileSync, renameSync, appendFileSync} from 'fs';
import {mkdirpSync} from 'fs-extra';
import {copyFiles} from './copy-files';
import {replaceVersionPlaceholders} from './version-placeholders';
import {inlinePackageMetadataFiles} from './metadata-inlining';
import {createTypingsReexportFile} from './typings-reexport';
import {createMetadataReexportFile} from './metadata-reexport';
import {getSecondaryEntryPointsForPackage} from './secondary-entry-points';
import {createEntryPointPackageJson} from './entry-point-package-json';
import {buildConfig} from './build-config';
import {BuildPackage} from './build-package';

const {packagesDir, outputDir, projectDir} = buildConfig;

/** Directory where all bundles will be created in. */
const bundlesDir = join(outputDir, 'bundles');

/**
 * Copies different output files into a folder structure that follows the `angular/angular`
 * release folder structure. The output will also contain a README and the according package.json
 * file. Additionally the package will be Closure Compiler and AOT compatible.
 */
export function composeRelease(buildPackage: BuildPackage) {
  const {packageName, packageOut, packageRoot} = buildPackage;
  const releasePath = join(outputDir, 'releases', packageName);

  inlinePackageMetadataFiles(packageOut);

  copyFiles(packageOut, '**/*.+(d.ts|metadata.json)', join(releasePath, 'typings'));
  copyFiles(bundlesDir, `${packageName}?(-*).umd?(.min).js?(.map)`, join(releasePath, 'bundles'));
  copyFiles(bundlesDir, `${packageName}?(.es5).js?(.map)`, join(releasePath, '@angular'));
  copyFiles(join(bundlesDir, packageName), '**', join(releasePath, '@angular', packageName));
  copyFiles(projectDir, 'LICENSE', releasePath);
  copyFiles(packagesDir, 'README.md', releasePath);
  copyFiles(packageRoot, 'package.json', releasePath);

  replaceVersionPlaceholders(releasePath);
  createTypingsReexportFile(releasePath, './typings/index', packageName);
  createMetadataReexportFile(releasePath, './typings/index', packageName);

  if (buildPackage.secondaryEntryPoints.length) {
    createFilesForSecondaryEntryPoint(buildPackage, releasePath);
  }

  // wip
  if (buildPackage.packageName === 'material') {
    copyFiles(join(bundlesDir, packageName), '**', join(releasePath, '@angular'));

    const es2015Path = join(releasePath, '@angular', 'material.js');
    const es5Path = join(releasePath, '@angular', 'material.es5.js');

    const es2015Exports = buildPackage.secondaryEntryPoints
        .map(p => `export * from './${p}';`).join('\n');
    const es5Exports = buildPackage.secondaryEntryPoints
        .map(p => `export * from './${p}.es5';`).join('\n');

    appendFileSync(es2015Path, '\n' + es2015Exports, 'utf-8');
    appendFileSync(es5Path, '\n' + es5Exports, 'utf-8');
    appendFileSync(join(releasePath, 'material.d.ts'), es2015Exports, 'utf-8');

    createMetadataReexportFile(releasePath, [
      './typings/index',
      ...buildPackage.secondaryEntryPoints.map(p => `./${p}`)
    ], packageName);
  }
}

/** Creates files necessary for a secondary entry-point. */
function createFilesForSecondaryEntryPoint(buildPackage: BuildPackage, releasePath: string) {
  const {packageName, packageOut} = buildPackage;

  getSecondaryEntryPointsForPackage(buildPackage).forEach(entryPointName => {
    // Create a directory in the root of the package for this entry point that contains
    // * A package.json that lists the different bundle locations
    // * An index.d.ts file that re-exports the index.d.ts from the typings/ directory
    // * A metadata.json re-export for this entry-point's metadata.
    const entryPointDir = join(releasePath, entryPointName);

    mkdirpSync(entryPointDir);
    createEntryPointPackageJson(entryPointDir, packageName, entryPointName);

    // Copy typings and metadata from tsc output location into the entry-point.
    copyFiles(
        join(packageOut, entryPointName),
        '**/*.+(d.ts|metadata.json)',
        join(entryPointDir, 'typings'));

    // Create a typings and a metadata re-export within the entry-point to point to the
    // typings we just copied.
    createTypingsReexportFile(entryPointDir, `./typings/index`, 'index');
    createMetadataReexportFile(entryPointDir, `./typings/index`, 'index');

    // Finally, create both a d.ts and metadata file for this entry-point in the root of
    // the package that re-exports from the entry-point's directory.
    createTypingsReexportFile(releasePath, `./${entryPointName}/index`, entryPointName);
    createMetadataReexportFile(releasePath, `./${entryPointName}/index`, entryPointName);
  });
}
