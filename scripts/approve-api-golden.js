#!/usr/bin/env node

const shelljs = require('shelljs');
const chalk = require('chalk');
const path = require('path');
const {guessPackageName} = require('./util');
const projectDir = path.join(__dirname, '../');

if (process.argv.length < 3) {
  console.error(chalk.red('No package name has been passed in for API golden approval.'));
  process.exit(1);
}

// ShellJS should exit if any command fails.
shelljs.set('-e');
shelljs.cd(projectDir);

for (const searchPackageName of process.argv.slice(2)) {
  const packageNameGuess = guessPackageName(searchPackageName, path.join(projectDir, 'src'));

  if (!packageNameGuess.result) {
    console.error(
      chalk.red(
        `Could not find package for API golden approval called ` +
          `${chalk.yellow(searchPackageName)}. Looked in packages:\n` +
          `${packageNameGuess.attempts.join('\n')}`,
      ),
    );
    process.exit(1);
  }

  const [packageName, ...entryPointTail] = packageNameGuess.result.split('/');
  const suffix = entryPointTail.length ? entryPointTail.join('-') : packageName;
  const apiGoldenTargetName = `//tools/public_api_guard:${packageName}/${suffix}.md_api.accept`;

  shelljs.touch(path.join(projectDir, `tools/public_api_guard/${packageName}/${suffix}.md`));
  shelljs.exec(`yarn bazel run ${apiGoldenTargetName}`);
}
