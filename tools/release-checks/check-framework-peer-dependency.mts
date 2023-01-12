import {Log, ReleasePrecheckError} from '@angular/ng-dev';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import {existsSync, readFileSync} from 'fs';
import semver from 'semver';

/** Path to the current directory. */
const currentDir = dirname(fileURLToPath(import.meta.url));

/** Path to the Bazel file that configures the release output. */
const bzlConfigPath = join(currentDir, '../../packages.bzl');

/**
 * Ensures that the Angular version placeholder has been correctly updated to support
 * given Angular versions. The following rules apply:
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
 */
export async function assertValidFrameworkPeerDependency(newVersion: semver.SemVer) {
  const currentVersionRange = _extractAngularVersionPlaceholderOrThrow();
  const isPrerelease = !!newVersion.prerelease[0];
  let requiredRange: string;

  if (isPrerelease) {
    requiredRange =
      `^${newVersion.major}.0.0-0 || ` +
      `^${newVersion.major}.1.0-0 || ` +
      `^${newVersion.major}.2.0-0 || ` +
      `^${newVersion.major}.3.0-0 ||` +
      `^${newVersion.major + 1}.0.0-0`;
  } else {
    requiredRange = `^${newVersion.major}.0.0 || ^${newVersion.major + 1}.0.0`;
  }

  if (requiredRange !== currentVersionRange) {
    Log.error(
      `  ✘   Cannot stage release. The required Angular version range ` +
        `is invalid. The version range should be: ${requiredRange}`,
    );
    Log.error(`      Please manually update the version range ` + `in: ${bzlConfigPath}`);
    throw new ReleasePrecheckError();
  }
}

/**
 * Gets the Angular version placeholder from the bazel release config. If
 * the placeholder could not be found, the process will be terminated.
 */
function _extractAngularVersionPlaceholderOrThrow(): string {
  if (!existsSync(bzlConfigPath)) {
    Log.error(
      `  ✘   Cannot stage release. Could not find the file which sets ` +
        `the Angular peerDependency placeholder value. Looked for: ${bzlConfigPath}`,
    );
    throw new ReleasePrecheckError();
  }

  const configFileContent = readFileSync(bzlConfigPath, 'utf8');
  const matches = configFileContent.match(/ANGULAR_PACKAGE_VERSION = ["']([^"']+)/);
  if (!matches || !matches[1]) {
    Log.error(
      `  ✘   Cannot stage release. Could not find the ` +
        `"ANGULAR_PACKAGE_VERSION" variable. Please ensure this variable exists. ` +
        `Looked in: ${bzlConfigPath}`,
    );
    throw new ReleasePrecheckError();
  }
  return matches[1];
}
