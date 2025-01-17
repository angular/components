/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import fs from 'fs';
import path from 'path';
import url from 'url';
import semver from 'semver';

/** Custom stamping on top of the default `ng-dev` release stamping. */
export default async function (mode) {
  const scriptDir = path.dirname(url.fileURLToPath(import.meta.url));
  const projectDir = path.join(scriptDir, '../');
  const packageJsonRaw = await fs.promises.readFile(path.join(projectDir, 'package.json'));
  const {version: versionRaw} = JSON.parse(packageJsonRaw);
  const version = semver.parse(versionRaw);

  console.info(`STABLE_FRAMEWORK_PEER_DEP_RANGE ${computeFrameworkPeerDependency(version)}`);
}

/**
 * Computes the Angular peer dependency range. The following rules apply:
 *
 *   `N.x.x` requires Angular `^N.0.0 || ^(N+1).0.0`
 *   `N.x.x-x` requires Angular `^N.0.0-0 || ^N.1.0-0 || ^N.2.0-0 || ^N.3.0-0 || ^(N+1).0.0-0`
 *
 * The rationale is that we want to satisfy peer dependencies if we are publishing
 * pre-releases for a major while Angular framework cuts pre-releases as well. e.g.
 * Angular CDK v14.0.0-rc.1 should also work with `@angular/core@v14.0.0-rc.1`.
 *
 * Note: When we cut pre-releases, the peer dependency includes all anticipated
 * pre-releases because a range like `^15.0.0-0` itself would not allow for future minor
 * releases like `15.1.0-next.0`. NPM requires the explicit minors pre-release ranges.
 *
 * @param {semver.SemVer} version Current project version.
 * @returns {string} The NPM peer dependency for depending on framework.
 */
function computeFrameworkPeerDependency(version) {
  if (version.prerelease[0] !== undefined) {
    return (
      `^${version.major}.0.0-0 || ` +
      `^${version.major}.1.0-0 || ` +
      `^${version.major}.2.0-0 || ` +
      `^${version.major}.3.0-0 || ` +
      `^${version.major + 1}.0.0-0`
    );
  }

  return `^${version.major}.0.0 || ^${version.major + 1}.0.0`;
}
