#!/usr/bin/env node

import chalk from 'chalk';
import {join} from 'path';
import sh from 'shelljs';
import {guessPackageName} from './util.mjs';

const bazel = process.env['BAZEL'] || 'pnpm -s bazel';

if (process.argv.length < 3) {
  console.error(chalk.red('No package name has been passed in for API golden approval.'));
  process.exit(1);
}

sh.set('-e');

for (const searchPackageName of process.argv.slice(2)) {
  const packageNameGuess = guessPackageName(searchPackageName, join(process.cwd(), 'src'));

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

  const [packageName] = packageNameGuess.result.split('/');
  const apiGoldenTargetName = `//goldens:${packageName}_api.accept`.replace(/-/g, '_');

  sh.exec(`${bazel} run ${apiGoldenTargetName}`);
}
