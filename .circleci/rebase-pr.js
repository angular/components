#! /usr/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * **Usage:**
 * ```
 * node rebase-pr <github-repository> <pull-request-number>
 * ```
 * **Example:**
 * ```
 * node rebase-pr angular/angular 123
 * ```
 *
 * Rebases the current branch on top of the GitHub PR target branch.
 *
 * **Context:**
 * Since a GitHub PR is not necessarily up to date with its target branch, it is useful to rebase
 * prior to testing it on CI to ensure more up to date test results.
 *
 * **Implementation details:**
 * This script obtains the base for a GitHub PR via the
 * [GitHub PR API](https://developer.github.com/v3/pulls/#get-a-single-pull-request), then
 * fetches that branch, and rebases the current branch on top of it.
 *
 * **NOTE:**
 * This script cannot use external dependencies or be compiled because it needs to run before the
 * environment is setup.
 * Use only features supported by the NodeJS versions used in the environment.
 */

// This script uses `console` to print messages to the user.
// tslint:disable:no-console

// Imports
const util = require('util');
const {exec, execSync: execSync_} = require('child_process');
const exec_ = util.promisify(exec);


// Helpers
async function _main() {
  const refs = await getRefsAndShasForChange();

  // Log known refs and shas
  console.log(`--------------------------------`);
  console.log(`    Target Branch:                   ${refs.base.ref}`);
  console.log(`    Latest Commit for Target Branch: ${refs.target.latestSha}`);
  console.log(`    Latest Commit for PR:            ${refs.base.latestSha}`);
  console.log(`    First Common Ancestor SHA:       ${refs.commonAncestorSha}`);
  console.log(`--------------------------------`);
  console.log();



  // Get the count of commits between the latest commit from origin and the common ancestor SHA.
  const {stdout: commitCount} =
      await exec_(`git rev-list --count origin/${refs.base.ref}...${refs.commonAncestorSha}`);
  console.log(`Checking ${commitCount.trim()} commits for changes in the CircleCI config file.`);

  // Check if the files changed between the latest commit from origin and the common ancestor SHA
  // includes the CircleCI config.
  const {stdout: circleCIConfigChanged} = await exec_(`git diff --name-only origin/${
      refs.base.ref} ${refs.commonAncestorSha} -- .circleci/config.yml`);

  if (!!circleCIConfigChanged) {
    throw Error(`
        CircleCI config on ${refs.base.ref} has been modified since commit ${
        refs.commonAncestorSha.slice(0, 7)},
        which this PR is based on.

        Please rebase the PR on ${refs.base.ref} after fetching from upstream.

        Rebase instructions for PR Author, please run the following commands:

          git fetch upstream ${refs.base.ref};
          git checkout ${refs.target.ref};
          git rebase upstream/${refs.base.ref};
          git push --force-with-lease;
        `);
  } else {
    console.log('No change found in the CircleCI config file, continuing.');
  }
  console.log();

  // Rebase the PR.
  console.log(`Rebasing current branch on ${refs.base.ref}.`);
  await exec_(`git rebase origin/${refs.base.ref}`);
  console.log('Rebase successful.');
}

/** A regex to select a ref that matches our semver refs. */
const semverRegex = /^(\d+)\.(\d+)\.x$/;

/**
 * Synchronously executes the command.
 *
 * Return the trimmed stdout as a string, with an added attribute of the exit code.
 */
function execSync(command, allowStderr = true) {
  let output = new String();
  output.code = 0;
  try {
    output += execSync_(command, {stdio: ['pipe', 'pipe', 'pipe']}).toString().trim();
  } catch (err) {
    allowStderr && console.error(err.stderr.toString());
    output.code = err.status;
  }
  return output;
}

/**
 * Sort a list of fullpath refs into a list and then provide the first entry.
 *
 * The sort order will first find master ref, and then any semver ref, followed
 * by the rest of the refs in the order provided.
 *
 * Branches are sorted in this order as work is primarily done on master, and
 * otherwise on a semver branch. If neither of those were to match, the most
 * likely correct branch will be the first one encountered in the list.
 */
function getRefFromBranchList(gitOutput, remote) {
  const branches = gitOutput.split('\n').map(b => b.split('/').slice(1).join('').trim());
  return branches.sort((a, b) => {
    if (a === 'master') {
      return -1;
    }
    if (b === 'master') {
      return 1;
    }
    const aIsSemver = semverRegex.test(a);
    const bIsSemver = semverRegex.test(b);
    if (aIsSemver && bIsSemver) {
      const [, aMajor, aMinor] = a.match(semverRegex);
      const [, bMajor, bMinor] = b.match(semverRegex);
      return parseInt(bMajor, 10) - parseInt(aMajor, 10) ||
          parseInt(aMinor, 10) - parseInt(bMinor, 10) || 0;
    }
    if (aIsSemver) {
      return -1;
    }
    if (bIsSemver) {
      return 1;
    }
    return 0;
  })[0];
}

/**
 * Get the full sha of the ref provided.
 *
 * example: 1bc0c1a6c01ede7168f22fa9b3508ba51f1f464e
 */
function getShaFromRef(ref) {
  return execSync(`git rev-parse ${ref}`);
}

/**
 * Get the list of branches which contain the provided sha, sorted in descending order
 * by committerdate.
 *
 * example:
 *   upstream/master
 *   upstream/9.0.x
 *   upstream/test
 *   upstream/1.1.x
 */
function getBranchListForSha(sha, remote) {
  return execSync(`git branch -r '${remote}/*' --sort=-committerdate --contains ${sha}`);
}

/** Get the common ancestor sha of the two provided shas. */
function getCommonAncestorSha(sha1, sha2) {
  return execSync(`git merge-base ${sha1} ${sha2}`);
}

/** Removes the remote from git. */
function removeRemote(remote) {
  execSync(`git remote remove ${remote}`);
}

/**
 * Adds the remote to git, if it doesn't already exist. Returns a boolean indicating
 * whether the remote was added by the command.
 */
function addRemote(remote) {
  return !execSync(`git remote add ${remote} https://github.com/${remote}/angular.git`, false).code;
}

/** Fetch latest from the remote. */
function fetchRemote(remote) {
  execSync(`git fetch ${remote}`);
}

/**
 * Get the nearest ref which the HEAD has a parent commit.
 *
 * Checks up to a limit of 100 previous shas.
 */
function getParentBranchForHead(remote) {
  // Get the latest for the remote.
  fetchRemote(remote);

  let headCount = 0;
  while (headCount < 100) {
    // Attempt to get the ref on the remote for the sha.
    const branches = getBranchListForSha(`HEAD~${headCount}`, remote);
    const ref = getRefFromBranchList(branches, remote);
    // If the ref exists, get the sha and latest sha for the remote ref.
    if (ref) {
      const sha = getShaFromRef(`HEAD~${headCount}`);
      const latestSha = getShaFromRef(`${remote}/${ref}`);
      return {ref, sha, latestSha, remote};
    }
    headCount++;
  }
  return {ref: '', latestSha: '', sha, remote};
}

/** Get the ref and latest shas for the provided sha on a specific remote. */
function getRefAndShas(sha, remote) {
  // Ensure the remote is defined in git.
  let markRemoteForClean = addRemote(remote);
  // Get the latest from the remote.
  fetchRemote(remote);

  // Get the ref on the remote for the sha provided.
  const branches = getBranchListForSha(sha, remote);
  const ref = getRefFromBranchList(branches, remote);

  // Get the latest sha on the discovered remote ref.
  const latestSha = getShaFromRef(`${remote}/${ref}`);

  // Clean up the remote if it didn't exist before execution.
  if (markRemoteForClean) {
    removeRemote(remote);
  }

  return {remote, ref, latestSha, sha};
}


/** Gets the refs and shas for the base and target of the current environment. */
function getRefsAndShasForChange() {
  let base, target;
  if (process.env['CI']) {
    base = getRefAndShas(process.env['CIRCLE_GIT_BASE_REVISION'], process.env['CIRCLE_PR_USERNAME']);
    target = getRefAndShas(process.env['CIRCLE_GIT_REVISION'], process.env['CIRCLE_PROJECT_USERNAME']);
  } else {
    const originSha = getShaFromRef(`HEAD`);
    target = getRefAndShas(originSha, 'origin');
    base = getParentBranchForHead('upstream');
  }
  const commonAncestorSha = getCommonAncestorSha(base.sha, target.sha);
  return {
    base,
    target,
    commonAncestorSha,
  };
}


// Run
_main().catch(err => {
  console.log('Failed to rebase on top of target branch.\n');
  console.error(err);
  process.exitCode = 1;
});
