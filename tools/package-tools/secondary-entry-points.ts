import {join} from 'path';
import {readdirSync, lstatSync} from 'fs';
import {buildConfig} from './build-config';

/** Blacklist of directories which are not considered secondary entry-points. */
const DIRECTORY_BLACKLIST = ['testing'];

/**
 * Gets secondary entry-points for a given package.
 *
 * This currently assumes that every directory under a package should be an entry-point. This may
 * not always be desired, in which case we can add an extra build configuration for specifying the
 * entry-points.
 *
 * @param packageName The package name for which to get entry points, e.g., 'cdk'.
 * @returns An array of secondary entry-points names, e.g., ['a11y', 'bidi', ...]
 */
export function getSecondaryEntryPointsForPackage(_packageName: string) {
  // Order matters
  return [
    'keyboard',
    'coercion',
    'platform',
    'bidi',
    'rxjs',
    'observe-content',
    'portal',
    'a11y',
    'table',
  ];

  // const rootPackageDir = join(buildConfig.packagesDir, packageName);
  // return readdirSync(rootPackageDir)
  //     .filter(f =>
  //         lstatSync(join(rootPackageDir, f)).isDirectory() && DIRECTORY_BLACKLIST.indexOf(f) < 0);
}
