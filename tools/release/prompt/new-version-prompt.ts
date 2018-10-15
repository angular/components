import {parseVersionName, VersionInfo} from '../version-name/parse-version';
import {bold, red, yellow} from 'chalk';
import {ChoiceType, prompt} from 'inquirer';
import {createNewVersion} from '../version-name/create-version';
import {ReleaseType, validateExpectedVersion} from '../version-name/check-version';

/** Answers that will be prompted for. */
type VersionPromptAnswers = {
  releaseType: ReleaseType;
  versionName: string;
};

/** Available options for selecting a release type. */
const releaseTypeChoices = {
  custom: {value: 'custom', name: 'Release w/ custom version.'},
  stable: {value: 'stable', name: `Stable release`},
  major: {value: 'major', name: 'Major release'},
  minor: {value: 'minor', name: 'Minor release'},
  patch: {value: 'patch', name: 'Patch release'},
};

/**
 * Prompts the current user-input interface for a new version name. The new version will be
 * validated to be a proper increment of the specified current version.
 */
export async function promptForNewVersion(versionName: string): Promise<VersionInfo> {
  const currentVersion = parseVersionName(versionName);
  let allowedReleaseTypes: ChoiceType[] = [releaseTypeChoices.custom];

  if (!currentVersion) {
    console.warn(red(`Cannot parse current project version. This means that we cannot validate ` +
      `the new ${bold('custom')} version that will be specified.`));
  } else if (currentVersion.suffix) {
    console.warn(yellow(`Since the current project version is a ` +
      `"${bold(currentVersion.suffix)}", the new version can be either custom or just the ` +
      `stable version.`));
    allowedReleaseTypes.unshift(releaseTypeChoices.stable);
  } else {
    allowedReleaseTypes.unshift(
      releaseTypeChoices.major, releaseTypeChoices.minor, releaseTypeChoices.patch);
  }

  const answers = await prompt<VersionPromptAnswers>([{
    type: 'list',
    name: 'releaseType',
    message: `What's the type of the new release?`,
    choices: allowedReleaseTypes,
  }, {
    type: 'input',
    name: 'versionName',
    message: 'Please provide the new release name:',
    default: ({releaseType}) => createVersionSuggestion(releaseType, currentVersion!),
    validate: (enteredVersion, {releaseType}) =>
      validateNewVersionName(enteredVersion, currentVersion!, releaseType),
  }]);

  return parseVersionName(answers.versionName);
}

/** Creates a suggested version for the expected version type. */
function createVersionSuggestion(releaseType: ReleaseType, currentVersion: VersionInfo) {
  // In case the new version is expected to be custom, we can not make any suggestion because
  // we don't know the reasoning for a new custom version.
  if (releaseType === 'custom') {
    return null;
  } else if (releaseType === 'stable') {
    return createNewVersion(currentVersion!).format();
  }

  return createNewVersion(currentVersion!, releaseType).format();
}

/**
 * Validates the specified new version by ensuring that the new version is following the Semver
 * format and matches the specified target version type.
 */
function validateNewVersionName(newVersionName: string, currentVersion: VersionInfo,
                                releaseType: ReleaseType) {
  const parsedVersion = parseVersionName(newVersionName);

  if (!parsedVersion) {
    return 'Version does not follow the Semver format.';
  }

  // In case the release type is custom, we just need to make sure that the new version
  // is following the Semver format.
  if (releaseType === 'custom') {
    return true;
  }

  if (!validateExpectedVersion(parsedVersion, currentVersion, releaseType)) {
    return `Version is not a proper increment for "${releaseType}"`;
  }

  return true;
}
