/**
 * Script that sets up the Angular snapshot github builds. We set up the snapshot builds by
 * overwriting the versions in the "package.json" and taking advantage of pnpm's override
 * feature. Pnpm overrides will be used to flatten transitive Angular packages.
 *
 *  node_modules/compiler@snapshot
 *  node_modules/compiler-cli@snapshot
 *    node_modules/compiler@7.0.1
 */

/**
 * Array defining the packages we would like to install snapshots for.
 *
 * Additionally each entry will have a mapping to the corresponding snapshot
 * builds repo name. This is necessary as the repository names are inconsistent.
 */
const snapshotPackages = [
  {matcher: /^@angular\/(.+)$/, repoName: `angular/$1-builds`},
  {matcher: /^@angular-devkit\/(.+)$/, repoName: `angular/angular-devkit-$1-builds`},
  {matcher: /^@schematics\/(.+)$/, repoName: `angular/schematics-$1-builds`},
];

/** List of packages which should not be updated to a snapshot build. */
const ignorePackages = [
  // Skip update for the shared dev-infra packages. We do not want to update to a snapshot
  // version of the dev-infra tooling as that could break tooling from running snapshot
  // tests for the actual snapshot Angular framework code.
  '@angular/build-tooling',
  '@angular/ng-dev',
  // TODO(ESM-MIGRATION): Angular Bazel no longer generates dev-mode and relies on `ts_library`
  //  being patched. Until our setup is compatible with it, we do not update `@angular/bazel`.
  '@angular/bazel',
];

const {writeFileSync} = require('fs');
const {join} = require('path');

const [tag] = process.argv.slice(2);
const projectDir = join(__dirname, '../../');
const packageJsonPath = join(projectDir, 'package.json');
const packageJson = require(packageJsonPath);
const packageSuffix = tag ? ` (${tag})` : '';

const packagesToConsider = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
});

// List of packages which should be updated to their most recent snapshot version, or
// snapshot version based on the specified tag.
const packagesToUpdate = packagesToConsider.reduce((result, name) => {
  if (ignorePackages.includes(name)) {
    return result;
  }

  const matchedEntry = snapshotPackages.find(p => p.matcher.test(name));
  if (matchedEntry === undefined) {
    return result;
  }
  const repoName = name.replace(matchedEntry.matcher, matchedEntry.repoName);

  return result.concat([{name, repoName}]);
}, []);

console.log('Setting up snapshot builds for:\n');
console.log(`  ${packagesToUpdate.map(p => `${p.name}${packageSuffix}`).join('\n  ')}\n`);

// Setup the snapshot version for each Angular package specified in the "package.json" file.
packagesToUpdate.forEach(({name, repoName}) => {
  const buildsUrl = `github:angular/${repoName}${tag ? `#${tag}` : ''}`;

  // Add overrides for each package in the format "**/{PACKAGE}" so that all
  // nested versions of that specific Angular package will have the same version.
  packageJson.pnpm.overrides[`**/${name}`] = buildsUrl;

  // Since the resolutions only cover the version of all nested installs, we also need
  // to explicitly set the version for the package listed in the project "package.json".
  packageJson.dependencies[name] = buildsUrl;

  // In case this dependency was previously a dev dependency, just remove it because we
  // re-added it as a normal dependency for simplicity.
  delete packageJson.devDependencies[name];
});

// Write changes to the "packageJson", so that we can install the new versions afterwards.
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Successfully added the "resolutions" to the "package.json".');
