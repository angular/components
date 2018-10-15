import {spawnSync} from 'child_process';

/**
 * Class that can be used to execute Git commands within a given project directory. Relying
 * on the working directory of the current process is not good because it's not guaranteed
 * that the working directory is always the target project directory (e.g. w/ bazel run).
 */
export class GitCommandExecutor {

  constructor(public projectDir: string) {}

  /** Returns the currently checked out branch for the current working directory. */
  getCurrentBranch() {
    return spawnSync('git', ['symbolic-ref', '--short', 'HEAD'], {cwd: this.projectDir})
      .stdout.toString().trim();
  }

  /** Returns the commit SHA for the remote repository reference. */
  getRemoteCommitSha(remoteRef: string, branchName: string): string {
    return spawnSync('git', ['ls-remote', remoteRef, '-h', `refs/heads/${branchName}`],
      {cwd: this.projectDir}).stdout.toString().trim();
  }

  /** Returns the latest commit SHA for the specified git reference. */
  getLocalCommitSha(refName: string) {
    return spawnSync('git', ['rev-parse', refName], {cwd: this.projectDir})
      .stdout.toString().trim();
  }

  /** Whether the current Git repository has uncommitted changes. */
  hasUncommittedChanges(): boolean {
    return spawnSync('git', ['diff-index', '--quiet', 'HEAD'], {cwd: this.projectDir}).status !== 0;
  }

  /** Creates a new branch which is based on the previous active branch. */
  checkoutNewBranch(branchName: string): boolean {
    return spawnSync('git', ['checkout', '-b', branchName], {cwd: this.projectDir}).status === 0;
  }

  /** Stages all changes by running `git add -A`. */
  stageAllChanges(): boolean {
    return spawnSync('git', ['add', '-A'], {cwd: this.projectDir}).status === 0;
  }

  /** Creates a new commit within the current branch with the given commit message. */
  createNewCommit(message: string): boolean {
    return spawnSync('git', ['commit', '-m', message], {cwd: this.projectDir}).status === 0;
  }
}

