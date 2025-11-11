/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Packages that will be published as part of the project.
 *
 * Note: The order of packages here will control how sections
 * appear in the changelog.
 */
export const releasePackages = [
  'aria',
  'cdk',
  'material',
  'google-maps',
  'youtube-player',
  'cdk-experimental',
  'material-experimental',
  'material-moment-adapter',
  'material-luxon-adapter',
  'material-date-fns-adapter',
];

/**
 * Configuration for the `ng-dev release` command.
 *
 * @type { import("@angular/ng-dev").ReleaseConfig }
 */
export const release = {
  releaseNotes: {
    useReleaseTitle: true,
    groupOrder: releasePackages,
    categorizeCommit: commit => {
      const [packageName, entryPointName] = commit.scope.split('/');
      const entryPointPrefix = entryPointName ? `**${entryPointName}:** ` : '';

      // In the `angular/components` repository, commit messages may include entry-point
      // information in the scope. We expect commits to be grouped based on their package
      // name. Commits are then described with their subject and optional entry-point name.
      return {
        groupName: packageName,
        description: `${entryPointPrefix}${commit.subject}`,
      };
    },
  },
  publishRegistry: 'https://wombat-dressing-room.appspot.com',
  representativeNpmPackage: '@angular/cdk',
  npmPackages: releasePackages.map(pkg => ({name: `@angular/${pkg}`})),
  buildPackages: async () => {
    // The `performNpmReleaseBuild` function is loaded at runtime as loading of the
    // script results in an invocation of Bazel for any `pnpm ng-dev` command.
    const {performNpmReleaseBuild} = await import('../scripts/build-packages-dist.mjs');
    return performNpmReleaseBuild();
  },
  prereleaseCheck: async (newVersionStr, builtPackagesWithInfo) => {
    const semver = await import('semver');
    const assertValidUpdateMigrationCollections = await import(
      '../tools/release-checks/check-migration-collections.mjs'
    );
    const assertValidNpmPackageOutput = await import(
      '../tools/release-checks/npm-package-output/index.mjs'
    );
    const newVersion = new semver.SemVer(newVersionStr);

    await assertValidUpdateMigrationCollections(newVersion);
    await assertValidNpmPackageOutput(builtPackagesWithInfo, newVersion);
  },
};
