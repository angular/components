#!/usr/bin/env node

import chalk from 'chalk';
import {execFileSync} from 'child_process';
import {join} from 'path';
import sh from 'shelljs';
import {guessPackageName} from './util.mjs';

const targetsToRun = new Set<string>();

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
  targetsToRun.add(`//goldens:${packageName}_api.accept`.replace(/-/g, '_'));
}

for (const target of targetsToRun) {
  execFileSync('pnpm', ['-s', 'bazel', 'run', target], {stdio: 'inherit'});
}
