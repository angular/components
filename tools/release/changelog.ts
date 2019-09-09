import {bold, green, yellow} from 'chalk';
import {createReadStream, createWriteStream, readFileSync} from 'fs';
import {prompt} from 'inquirer';
import {join} from 'path';
import {Readable} from 'stream';
import {releasePackages} from './release-output/release-packages';

// These imports lack type definitions.
const conventionalChangelog = require('conventional-changelog');
const changelogCompare = require('conventional-changelog-writer/lib/util');
const merge2 = require('merge2');

/** Prompts for a changelog release name and prepends the new changelog. */
export async function promptAndGenerateChangelog(changelogPath: string) {
  const releaseName = await promptChangelogReleaseName();
  await prependChangelogFromLatestTag(changelogPath, releaseName);
}

/**
 * Writes the changelog from the latest Semver tag to the current HEAD.
 * @param changelogPath Path to the changelog file.
 * @param releaseName Name of the release that should show up in the changelog.
 */
export async function prependChangelogFromLatestTag(changelogPath: string, releaseName: string) {
  const outputStream: Readable = conventionalChangelog(
      /* core options */ {preset: 'angular'},
      /* context options */ {title: releaseName},
      /* raw-commits options */ null,
      /* commit parser options */ {
        // Expansion of the convention-changelog-angular preset to extract the package
        // name from the commit message.
        headerPattern: /^(\w*)(?:\((?:([^/]+)\/)?(.*)\))?: (.*)$/,
        headerCorrespondence: ['type', 'package', 'scope', 'subject'],
      },
      /* writer options */ createChangelogWriterOptions(changelogPath));

  // Stream for reading the existing changelog. This is necessary because we want to
  // actually prepend the new changelog to the existing one.
  const previousChangelogStream = createReadStream(changelogPath);

  return new Promise((resolve, reject) => {
    // Sequentially merge the changelog output and the previous changelog stream, so that
    // the new changelog section comes before the existing versions. Afterwards, pipe into the
    // changelog file, so that the changes are reflected on file system.
    const mergedCompleteChangelog = merge2(outputStream, previousChangelogStream);

    // Wait for the previous changelog to be completely read because otherwise we would
    // read and write from the same source which causes the content to be thrown off.
    previousChangelogStream.on('end', () => {
      mergedCompleteChangelog.pipe(createWriteStream(changelogPath))
          .once('error', (error: any) => reject(error))
          .once('finish', () => resolve());
    });
  });
}

/** Prompts the terminal for a changelog release name. */
export async function promptChangelogReleaseName(): Promise<string> {
  return (await prompt<{releaseName: string}>({
           type: 'text',
           name: 'releaseName',
           message: 'What should be the name of the release?'
         }))
      .releaseName;
}

/**
 * Creates changelog writer options which ensure that commits which are duplicated, or for
 * experimental packages do not showing up multiple times. Commits can show up multiple times
 * if a changelog has been generated on a publish branch and has been cherry-picked into "master".
 * In that case, the changelog will already contain cherry-picked commits from master which might
 * be added to future changelog's on "master" again. This is because usually patch and minor
 * releases are tagged from the publish branches and therefore conventional-changelog tries to
 * build the changelog from last major version to master's HEAD when a new major version is being
 * published from the "master" branch.
 */
function createChangelogWriterOptions(changelogPath: string) {
  const existingChangelogContent = readFileSync(changelogPath, 'utf8');
  const commitSortFunction = changelogCompare.functionify(['type', 'scope', 'subject']);

  return {
    // Overwrite the changelog templates so that we can render the commits grouped
    // by package names.
    mainTemplate: readFileSync(join(__dirname, 'changelog-root-template.hbs'), 'utf8'),
    commitPartial: readFileSync(join(__dirname, 'changelog-commit-template.hbs'), 'utf8'),

    // Specify a writer option that can be used to modify the content of a new changelog section.
    // See: conventional-changelog/tree/master/packages/conventional-changelog-writer
    finalizeContext: (context: any) => {
      const packageGroups: {[packageName: string]: any[]} = {};

      context.commitGroups.forEach((group: any) => {
        group.commits.forEach((commit: any) => {
          // Filter out duplicate commits. Note that we cannot compare the SHA because the commits
          // will have a different SHA if they are being cherry-picked into a different branch.
          if (existingChangelogContent.includes(commit.subject)) {
            console.log(yellow(`  ↺   Skipping duplicate: "${bold(commit.header)}"`));
            return false;
          }

          // Commits which just specify a scope that refers to a package but do not follow
          // the commit format that is parsed by the conventional-changelog-parser, can be
          // still resolved to their package from the scope. This handles the case where
          // a commit targets the whole package and does not specify a specific scope.
          // e.g. "refactor(material-experimental): support strictness flags".
          if (!commit.package && commit.scope) {
            const matchingPackage = releasePackages.find(pkgName => pkgName === commit.scope);
            if (matchingPackage) {
              commit.scope = null;
              commit.package = matchingPackage;
            }
          }

          // TODO(devversion): once we formalize the commit message format and
          // require specifying the "material" package explicitly, we can remove
          // the fallback to the "material" package.
          const packageName = commit.package || 'material';
          const {color, title} = getTitleAndColorOfTypeLabel(commit.type);

          if (!packageGroups[packageName]) {
            packageGroups[packageName] = [];
          }

          packageGroups[packageName].push({
            typeDescription: title,
            typeImageUrl: `https://img.shields.io/badge/-${title}-${color}`,
            ...commit
          });
        });
      });

      context.packageGroups = Object.keys(packageGroups).sort().map(pkgName => {
        return {
          title: pkgName,
          commits: packageGroups[pkgName].sort(commitSortFunction),
        };
      });

      return context;
    }
  };
}

/** Gets the title and color from a commit type label. */
function getTitleAndColorOfTypeLabel(typeLabel: string): {title: string, color: string} {
  if (typeLabel === `Features`) {
    return {title: 'feature', color: 'green'};
  } else if (typeLabel === `Bug Fixes`) {
    return {title: 'bug fix', color: 'orange'};
  } else if (typeLabel === `Performance Improvements`) {
    return {title: 'performance', color: 'blue'};
  } else if (typeLabel === `Reverts`) {
    return {title: 'revert', color: 'grey'};
  } else if (typeLabel === `Documentation`) {
    return {title: 'docs', color: 'darkgreen'};
  } else if (typeLabel === `refactor`) {
    return {title: 'refactor', color: 'lightgrey'};
  }
  return {title: typeLabel, color: 'yellow'};
}

/** Entry-point for generating the changelog when called through the CLI. */
if (require.main === module) {
  promptAndGenerateChangelog(join(__dirname, '../../CHANGELOG.md')).then(() => {
    console.log(green('  ✓   Successfully updated the changelog.'));
  });
}
