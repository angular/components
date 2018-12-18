import * as OctokitApi from '@octokit/rest';
import {bold, green, italic, red, yellow} from 'chalk';
import {existsSync, readFileSync} from 'fs';
import {prompt} from 'inquirer';
import {join} from 'path';
import {GitReleaseTask} from './git-release-task';
import {GitClient} from './git/git-client';
import {promptForNpmDistTag} from './prompt/npm-dist-tag-prompt';
import {checkReleasePackage} from './release-output/check-packages';
import {releasePackages} from './release-output/release-packages';
import {parseVersionName, Version} from './version-name/parse-version';
import {execSync} from 'child_process';

/**
 * Class that can be instantiated in order to create a new release. The tasks requires user
 * interaction/input through command line prompts.
 */
class PublishReleaseTask extends GitReleaseTask {

  /** Path to the project package JSON. */
  packageJsonPath: string;

  /** Serialized package.json of the specified project. */
  packageJson: any;

  /** Parsed current version of the project. */
  currentVersion: Version;

  /** Instance of a wrapper that can execute Git commands. */
  git: GitClient;

  /** Octokit API instance that can be used to make Github API calls. */
  githubApi: OctokitApi;

  constructor(public projectDir: string,
              public repositoryOwner: string,
              public repositoryName: string) {
    super(new GitClient(projectDir,
      `https://github.com/${repositoryOwner}/${repositoryName}.git`));

    this.packageJsonPath = join(projectDir, 'package.json');

    console.log(this.projectDir);

    if (!existsSync(this.packageJsonPath)) {
      console.error(red(`The specified directory is not referring to a project directory. ` +
        `There must be a ${italic('package.json')} file in the project directory.`));
      process.exit(1);
    }

    this.packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'));
    this.currentVersion = parseVersionName(this.packageJson.version);

    if (!this.currentVersion) {
      console.error(red(`Cannot parse current version in ${italic('package.json')}. Please ` +
        `make sure "${this.packageJson.version}" is a valid Semver version.`));
      process.exit(1);
    }

    this.githubApi = new OctokitApi();
  }

  async run() {
    console.log();
    console.log(green('-----------------------------------------'));
    console.log(green(bold('  Angular Material release script')));
    console.log(green('-----------------------------------------'));
    console.log();

    // Ensure there are no uncommitted changes. Checking this before switching to a
    // publish branch is sufficient as unstaged changes are not specific to Git branches.
    this.verifyNoUncommittedChanges();

    // Branch that will be used to build the output for the release of the current version.
    const publishBranch = this.switchToPublishBranch(this.currentVersion);

    this.verifyLastCommitVersionBump();
    this.verifyLocalCommitsMatchUpstream(publishBranch);

    const npmDistTag = await promptForNpmDistTag(this.currentVersion);

    // In case the user wants to publish a stable version to the "next" npm tag, we want
    // to double-check because usually only pre-release's are pushed to that tag.
    if (npmDistTag === 'next' && !this.currentVersion.prereleaseLabel) {
      await this.promptStableVersionForNextTag();
    }

    this.buildReleasePackages();
    this.checkReleaseOutput();
  }

  /**
   * Verifies that the latest commit on the current branch is a version bump from the
   * staging script.
   */
  private verifyLastCommitVersionBump() {
    if (!/chore: bump version/.test(this.git.getCommitTitle('HEAD'))) {
      console.error(red(`  ✘   The latest commit of the current branch does not seem to be a ` +
        `version bump.`));
      console.error(red(`      Please stage the release using the staging script.`));
      process.exit(1);
    }
  }

  /** Builds all release packages that should be published. */
  private buildReleasePackages() {
    const binDir = join(this.projectDir, 'node_modules/.bin');
    const spawnOptions = {cwd: binDir, stdio: 'inherit'};

    // TODO(devversion): I'd prefer disabling the output for those, but it might be only
    // worth if we consider adding some terminal spinner library (like "ora").
    execSync('gulp clean', spawnOptions);
    execSync(`gulp ${releasePackages.map(name => `${name}:build-release`).join(' ')}`,
      spawnOptions);
  }

  /** Checks the release output by running the release-output validations. */
  private checkReleaseOutput() {
    const releasesPath = join(this.projectDir, 'dist/releases');
    let hasFailed = false;

    releasePackages.forEach(packageName => {
      if (!checkReleasePackage(releasesPath, packageName)) {
        hasFailed = true;
      }
    });

    // In case any release validation did not pass, abort the publishing because
    // the issues need to be resolved before publishing.
    if (hasFailed) {
      console.error(red(`  ✘   Release output does not pass all release validations. Please fix ` +
        `all failures or reach out to the team.`));
      process.exit(1);
    }
  }

  /**
   * Prompts the user whether he is sure that the current stable version should be
   * released to the "next" NPM dist-tag.
   */
  private async promptStableVersionForNextTag() {
    const {shouldContinue} = await prompt<{shouldContinue: boolean}>({
      type: 'confirm',
      name: 'shouldContinue',
      message: 'Are you sure that you want to release a stable version to the "next" tag?'
    });

    if (!shouldContinue) {
      console.log();
      console.log(yellow('Aborting publish...'));
      process.exit(0);
    }
  }
}

/** Entry-point for the create release script. */
if (require.main === module) {
  new PublishReleaseTask(join(__dirname, '../../'), 'angular', 'material2').run();
}

