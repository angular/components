/**
 * Configuration for the merge tool in `ng-dev`. This sets up the labels which
 * are respected by the merge script (e.g. the target labels).
 *
 * @type { import("@angular/ng-dev").PullRequestConfig }
 */
export const pullRequest = {
  // By default, the merge script merges locally with `git cherry-pick` and autosquash.
  // This has the downside of pull requests showing up as `Closed` instead of `Merged`.
  // In the components repository, since we don't use fixup or squash commits, we can
  // use the Github API merge strategy. That way we ensure that PRs show up as `Merged`.
  githubApiMerge: {
    default: 'squash',
    labels: [{pattern: 'merge: preserve commits', method: 'rebase'}],
  },
};
