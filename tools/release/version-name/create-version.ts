import {VersionInfo} from './parse-version';
import {VersionType} from './publish-branch';

/**
 * Creates a new version from the specified version based on the given target version type.
 * If no target version type has been specified, just the version suffix will be removed.
 */
export function createNewVersion(currentVersion: VersionInfo, targetVersionType?: VersionType):
    VersionInfo {
  // Clone the version object in order to keep the original version info un-modified.
  const newVersion = currentVersion.clone();

  // Since we increment the specified version, a suffix like `-beta.4` should be removed.
  newVersion.suffix = null;
  newVersion.suffixNumber = null;

  if (targetVersionType === 'major') {
    newVersion.major++;
    newVersion.minor = 0;
    newVersion.patch = 0;
  } else if (targetVersionType === 'minor') {
    newVersion.minor++;
    newVersion.patch = 0;
  } else if (targetVersionType === 'patch') {
    newVersion.patch++;
  }

  return newVersion;
}
