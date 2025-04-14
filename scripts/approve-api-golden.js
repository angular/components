#!/usr/bin/env node

const shelljs = require('shelljs');
const chalk = require('chalk');
const path = require('path');
const {guessPackageName} = require('./util');
const projectDir = path.join(__dirname, '../');
const bazel = process.env['BAZEL'] || 'pnpm -s bazel';

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

  const [packageName, ..._entryPointTail] = packageNameGuess.result.split('/');
  const apiGoldenTargetName = `//goldens:${packageName}_api.accept`.replace(/-/g, '_');

  shelljs.exec(`${bazel} run ${apiGoldenTargetName}`);
}
