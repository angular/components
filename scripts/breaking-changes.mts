import {join, relative} from 'path';
import {readFileSync} from 'fs';
import chalk from 'chalk';
import ts from 'typescript';

const projectRoot = process.cwd();

const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));

// Current version from the package.json. Splits it on the dash to ignore pre-release labels.
const packageVersion = packageJson.version.split('-')[0];

// Regex used to extract versions from a string.
const versionRegex = /\d+\.\d+\.\d+/;

// Goes through all of the TypeScript files in the project and puts
// together a summary of all of the pending and expired breaking changes.
const configFile = ts.readJsonConfigFile(join(projectRoot, 'tsconfig.json'), ts.sys.readFile);
const parsedConfig = ts.parseJsonSourceFileConfigFileContent(configFile, ts.sys, projectRoot);
const summary: {[version: string]: string[]} = {};

// Go through all the TS files in the project.
parsedConfig.fileNames.forEach((fileName: string) => {
  const sourceFile = ts.createSourceFile(
    fileName,
    readFileSync(fileName, 'utf8'),
    configFile.languageVersion,
  );
  const lineStarts = sourceFile.getLineStarts();
  const fileText = sourceFile.getFullText();
  const seenRanges = new Set<string>();

  // Go through each of the comments of the file.
  sourceFile.forEachChild(function walk(node) {
    ts.getLeadingCommentRanges(fileText, node.getFullStart())?.forEach(range => {
      const rangeKey = `${range.pos}-${range.end}`;

      // Ranges can apply to more than one node.
      if (seenRanges.has(rangeKey)) {
        return;
      }

      seenRanges.add(rangeKey);
      const comment = fileText.slice(range.pos, range.end);
      const versionMatch = comment.match(versionRegex);

      // Don't do any extra work if the comment doesn't indicate a breaking change.
      if (!versionMatch || comment.indexOf('@breaking-change') === -1) {
        return;
      }

      // Use a path relative to the project root, in order to make the summary more tidy.
      // Also replace escaped Windows slashes with regular forward slashes.
      const pathInProject = relative(projectRoot, sourceFile.fileName).replace(/\\/g, '/');
      const [version] = versionMatch;

      summary[version] = summary[version] || [];
      summary[version].push(`  ${pathInProject}: ${formatMessage(comment, range.pos, lineStarts)}`);
    });

    node.forEachChild(walk);
  });
});

// Go through the summary and log out all of the breaking changes.
Object.keys(summary).forEach(version => {
  const isExpired = hasExpired(packageVersion, version);
  const status = isExpired ? chalk.red('(expired)') : chalk.green('(not expired)');
  const header = chalk.bold(`Breaking changes for ${version} ${status}:`);
  const messages = summary[version].join('\n');

  console.log(isExpired ? chalk.red(header) : header);
  console.log(isExpired ? chalk.red(messages) : messages, '\n');
});

/**
 * Formats a message to be logged out in the breaking changes summary.
 * @param comment Contents of the comment that contains the breaking change.
 * @param position Position of the comment within the file.
 * @param lineStarts Indexes at which the individual lines start.
 */
function formatMessage(comment: string, position: number, lineStarts: readonly number[]) {
  // `lineStarts` is sorted so we could use binary search, but this isn't
  // particularly performance-sensitive so we search linearly instead.
  const lineNumber = lineStarts.findIndex(line => line > position);
  const messageMatch = comment.match(/@deprecated(.*)|@breaking-change(.*)/);
  const message = messageMatch ? messageMatch[0] : '';
  const cleanMessage = message
    .replace(/[\*\/\r\n]|@[\w-]+/g, '')
    .replace(versionRegex, '')
    .trim();

  return `Line ${lineNumber}, ${cleanMessage || 'No message'}`;
}

/** Converts a version string into an object. */
function parseVersion(version: string) {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(segment => parseInt(segment));
  return {major, minor, patch};
}

/**
 * Checks whether a version has expired, based on the current version.
 * @param currentVersion Current version of the package.
 * @param breakingChange Version that is being checked.
 */
function hasExpired(currentVersion: string, breakingChange: string) {
  if (currentVersion === breakingChange) {
    return true;
  }

  const current = parseVersion(currentVersion);
  const target = parseVersion(breakingChange);

  return (
    target.major < current.major ||
    (target.major === current.major && target.minor < current.minor) ||
    (target.major === current.major &&
      target.minor === current.minor &&
      target.patch < current.patch)
  );
}
