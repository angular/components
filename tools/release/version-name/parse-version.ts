/** Regular expression that matches version names and the individual version segments. */
const versionNameRegex = /^(\d+)\.(\d+)\.(\d+)(?:-(alpha|beta|rc)\.(\d)+)?$/;

export class VersionInfo {

  constructor(public major: number,
              public minor: number,
              public patch: number,
              public suffix?: string,
              public suffixNumber?: number) {}

  /** Serializes the version info into a string formatted version name. */
  format(): string {
    return serializeVersion(this);
  }

  clone(): VersionInfo {
    return new VersionInfo(this.major, this.minor, this.patch, this.suffix, this.suffixNumber);
  }
}

/**
 * Parses the specified version and returns an object that represents the individual
 * version segments.
 */
export function parseVersionName(version: string): VersionInfo | null {
  const matches = version.match(versionNameRegex);

  if (!matches) {
    return null;
  }

  return new VersionInfo(
    parseInt(matches[1]),
    parseInt(matches[2]),
    parseInt(matches[2]),
    matches[4],
    parseInt(matches[5]));
}

/** Serializes the specified version into a string. */
export function serializeVersion(newVersion: VersionInfo): string {
  const {major, minor, patch, suffix, suffixNumber} = newVersion;

  let versionString = `${major}.${minor}.${patch}`;

  if (newVersion.suffix) {
    versionString += `-${suffix}${suffixNumber ? `.${suffixNumber}` : ''}`;
  }

  return versionString;
}
