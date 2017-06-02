import {join} from 'path';
import {buildConfig} from './build-config';

if (!buildConfig) {
  throw 'No build config has been defined yet.' +
      'Configure the build before importing any other packaging file.';
}

/** Path to the root directory of the project. */
export const projectDir = buildConfig.projectDir;

/** Path to the directory where the whole output lives. */
export const outputDir = buildConfig.outputDir;

/** Path to the directory that contains all packages. */
export const packagesDir = buildConfig.packagesDir;

/** Path to the directory where all releases are built. */
export const releasesDir = join(buildConfig.outputDir, 'releases');

/** Path to the directory where all bundles are built. */
export const bundlesDir = join(buildConfig.outputDir, 'bundles');
