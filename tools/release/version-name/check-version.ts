import {VersionInfo} from './parse-version';
import {VersionType} from './publish-branch';

/**
 * Type of a release. The following are possible release types:
 *
 *  - Major release
 *  - Minor release
 *  - Patch release
 *  - Stable release (removes suffix, e.g. `-beta`)
 *  - Custom release (custom release version)
 */
export type ReleaseType = VersionType | 'stable' | 'custom';

/** Checks if the specified new version is the expected increment from the previous version. */
export function validateExpectedVersion(newVersion: VersionInfo, previousVersion: VersionInfo,
                                        releaseType: ReleaseType): boolean {
  if (newVersion.suffix || newVersion.suffixNumber) {
    return false;
  }

  if (releaseType === 'major' &&
      newVersion.major === previousVersion.major + 1 &&
      newVersion.minor === 0 &&
      newVersion.patch === 0) {
    return true;
  }

  if (releaseType === 'minor' &&
      newVersion.major === previousVersion.major &&
      newVersion.minor === previousVersion.minor + 1 &&
      newVersion.patch === 0) {
    return true;
  }

  if (releaseType === 'patch' &&
      newVersion.major === previousVersion.major &&
      newVersion.minor === previousVersion.minor &&
      newVersion.patch === previousVersion.patch + 1) {
    return true;
  }

  return releaseType === 'stable' &&
      newVersion.major === previousVersion.major &&
      newVersion.minor === previousVersion.minor &&
      newVersion.patch === previousVersion.patch;
}
