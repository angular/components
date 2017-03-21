import {spawn} from 'child_process';
import {existsSync, statSync, copySync} from 'fs-extra';
import {join} from 'path';
import {task} from 'gulp';
import {execTask} from '../util/task_helpers';
import {DIST_RELEASE, DIST_BUNDLES} from '../constants';

// There are no type definitions available for these imports.
import gulpRunSequence = require('run-sequence');
import minimist = require('minimist');

const argv = minimist(process.argv.slice(3));

task('build:release', function(done: () => void) {
  gulpRunSequence(
    'library:build',
    ':build:release:copy',
    done
  );
});

/** Task that merges the different bundles and outputs into the release folder. */
task(':build:release:copy', () => {
  // https://github.com/angular/angular/blob/master/build.sh#L293-L294
  copySync(join(DIST_BUNDLES, 'index.d.ts'), join(DIST_RELEASE, 'material.d.ts'));
  copySync(join(DIST_BUNDLES, 'index.metadata.json'), join(DIST_RELEASE, 'material.metadata.json'));


});

/** Make sure we're logged in. */
task(':publish:whoami', execTask('npm', ['whoami'], {
  silent: true,
  errMessage: 'You must be logged in to publish.'
}));

task(':publish:logout', execTask('npm', ['logout']));


function _execNpmPublish(label: string): Promise<{}> {
  const packageDir = DIST_RELEASE;
  if (!statSync(packageDir).isDirectory()) {
    return;
  }

  if (!existsSync(join(packageDir, 'package.json'))) {
    throw new Error(`"${packageDir}" does not have a package.json.`);
  }

  if (!existsSync(join(packageDir, 'LICENSE'))) {
    throw new Error(`"${packageDir}" does not have a LICENSE file`);
  }

  process.chdir(packageDir);
  console.log(`Publishing material...`);

  const command = 'npm';
  const args = ['publish', '--access', 'public', label ? `--tag` : undefined, label || undefined];
  return new Promise((resolve, reject) => {
    console.log(`  Executing "${command} ${args.join(' ')}"...`);
    if (argv['dry']) {
      resolve();
      return;
    }

    const childProcess = spawn(command, args);
    childProcess.stdout.on('data', (data: Buffer) => {
      console.log(`  stdout: ${data.toString().split(/[\n\r]/g).join('\n          ')}`);
    });
    childProcess.stderr.on('data', (data: Buffer) => {
      console.error(`  stderr: ${data.toString().split(/[\n\r]/g).join('\n          ')}`);
    });

    childProcess.on('close', (code: number) => {
      if (code == 0) {
        resolve();
      } else {
        reject(new Error(`Material did not publish, status: ${code}.`));
      }
    });
  });
}

task(':publish', function(done: (err?: any) => void) {
  const label = argv['tag'];
  const currentDir = process.cwd();

  if (!label) {
    console.log('You can use a label with --tag=labelName.');
    console.log('Publishing using the latest tag.');
  } else {
    console.log(`Publishing using the ${label} tag.`);
  }
  console.log('\n\n');

  // Publish only the material package.
  return _execNpmPublish(label)
    .then(() => done())
    .catch((err: Error) => done(err))
    .then(() => process.chdir(currentDir));
});

task('publish', function(done: () => void) {
  gulpRunSequence(
    ':publish:whoami',
    'build:release',
    ':publish',
    ':publish:logout',
    done
  );
});
