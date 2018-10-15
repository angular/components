import {promptForNewVersion} from './prompt/new-version-prompt';
import {getExpectedPublishBranch} from './version-name/publish-branch';
import {bold, green, italic, red, yellow} from 'chalk';
import {readFileSync, writeFileSync, existsSync} from 'fs';
import {join} from 'path';
import {prompt} from 'inquirer';
import {GitCommandExecutor} from './git/executor';

/** Entry-point for the release staging script. */
async function main() {
  const projectDir = process.argv.slice(2)[0];
  const packageJsonPath = join(projectDir, 'package.json');

  if (!projectDir) {
    console.error(red(`Usage: bazel run //tools/release:stage-release <project-directory>`));
    process.exit(1);
  }

  if (!existsSync(projectDir)) {
    console.error(red(`You are not running the stage-release script inside of a project.`));
    process.exit(1);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const repositoryGitUrl = packageJson.repository.url;
  const gitExecutor = new GitCommandExecutor(projectDir);

  const newVersionInfo = await promptForNewVersion(packageJson.version);
  const expectedBranchName = getExpectedPublishBranch(newVersionInfo);
  const currentBranchName = gitExecutor.getCurrentBranch();

  // Check if current branch matches the expected publish branch.
  if (expectedBranchName !== currentBranchName) {
    console.error(red(`Cannot stage release "${bold(newVersionInfo.format())}" from ` +
      `"${italic(currentBranchName)}". Please stage the release from: ` +
      `"${bold(expectedBranchName)}".`));
    process.exit(1);
  }

  const upstreamCommitSha = gitExecutor.getRemoteCommitSha(repositoryGitUrl, expectedBranchName);
  const localCommitSha = gitExecutor.getLocalCommitSha('HEAD');

  // Check if the current branch is in sync with the remote branch.
  if (upstreamCommitSha !== localCommitSha) {
    console.error(red(`Cannot stage release. The current branch is not in sync with the remote ` +
      `branch. Please make sure: "${currentBranchName}" is up to date.`));
    process.exit(1);
  }

  if (gitExecutor.hasUncommittedChanges()) {
    console.error(red(`Cannot stage release. There are changes which are not committed and ` +
      `should be stashed.`));
    process.exit(1);
  }

  // TODO(devversion): Assert that GitHub statuses succeed for this branch.

  const newVersionName = newVersionInfo.format();
  const stagingBranch = `release-stage/${newVersionName}`;

  if (!gitExecutor.checkoutNewBranch(stagingBranch)) {
    console.error(red(`Could not create release staging branch: ${stagingBranch}. Aborting...`));
    process.exit(1);
  }

  packageJson.version = newVersionName;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log();
  console.log(green(`  ✓   Updated the version to "${bold(newVersionName)}" inside of the ` +
    `${italic('package.json')}`));

  // TODO(devversion): run changelog script w/prompts in the future.
  // For now, we just let users make modifications and stage the changes.

  console.log(yellow(`  ⚠   Please generate the ${bold('CHANGELOG')} for the new version. ` +
    `You can also make other unrelated modifications. After the changes have been made, ` +
    `just continue here.`));
  console.log();

  const {shouldContinue} = await prompt<{shouldContinue: boolean}>({
    type: 'confirm',
    name: 'shouldContinue',
    message: 'Do you want to proceed and commit the changes?'
  });

  if (!shouldContinue) {
    console.warn();
    console.warn(red('Aborting release staging...'));
    process.exit(1);
  }

  gitExecutor.stageAllChanges();
  gitExecutor.createNewCommit(`chore: bump version to ${newVersionName} w/ changelog`);

  console.info();
  console.info(green(`  ✓   Created the staging commit for: "${newVersionName}".`));
  console.info(green(`  ✓   Please push the changes and submit a PR on GitHub.`));
  console.info();

  // TODO(devversion): automatic push and PR open URL shortcut.
}

if (require.main === module) {
  main();
}

