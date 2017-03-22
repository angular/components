import {spawn} from 'child_process';
import {existsSync, statSync, copySync, writeFileSync} from 'fs-extra';
import {join} from 'path';
import {task, src, dest} from 'gulp';
import {execTask, sequenceTask} from '../util/task_helpers';
import {
  DIST_RELEASE, DIST_BUNDLES, DIST_MATERIAL, COMPONENTS_DIR, LICENSE_BANNER
} from '../constants';
import * as minimist from 'minimist';

// There are no type definitions available for these imports.
const gulpRename = require('gulp-rename');

/** Parse command-line arguments for release task. */
const argv = minimist(process.argv.slice(3));

// Matches all Typescript definition files for Material.
const typingsGlob = join(DIST_MATERIAL, '**/*.d.ts');
// Matches the "package.json" and "README.md" file that needs to be shipped.
const assetsGlob = join(COMPONENTS_DIR, '+(package.json|README.md)');
// Matches all UMD bundles inside of the bundles distribution.
const umdGlob = join(DIST_BUNDLES, '*.umd.*');
// Matches all flat ESM bundles (e.g material.js and material.es5.js)
const fesmGlob = [join(DIST_BUNDLES, '*.js'), `!${umdGlob}`];

task('build:release', sequenceTask(
  'library:build',
  ':package:release',
));

/** Task that combines intermediate build artifacts into the release package structure. */
task(':package:release', [
  ':package:metadata',
  ':package:typings',
  ':package:umd',
  ':package:fesm',
  ':package:assets'
]);

/** Copy metatadata.json and associated d.ts files to the root of the package structure. */
task(':package:metadata', [':package:fix-metadata'], () => {
  // See: https://github.com/angular/angular/blob/master/build.sh#L293-L294
  copySync(join(DIST_MATERIAL, 'index.metadata.json'),
      join(DIST_RELEASE, 'material.metadata.json'));
});

/**
 * Workaround for a @angular/tsc-wrapped issue, where the compiler looks for component assets
 * in the wrong folder. This issue only appears for bundled metadata files.
 * As a workaround, we just copy all assets next to the metadata bundle.
 **/
task(':package:fix-metadata', () => {
  return src('**/*.+(html|css)', { cwd: DIST_MATERIAL })
  .pipe(gulpRename({dirname: ''}))
  .pipe(dest(DIST_RELEASE));
});

task(':package:assets', () => src(assetsGlob).pipe(dest(DIST_RELEASE)));

/** Copy all d.ts except the special flat typings from ngc to typings/ in the release package. */
task(':package:typings', () => {
  return src(typingsGlob)
    .pipe(dest(join(DIST_RELEASE, 'typings')))
    .on('end', () => createTypingFile());
});

/** Copy umd bundles to the root of the release package. */
task(':package:umd', () => src(umdGlob).pipe((dest(join(DIST_RELEASE, 'bundles')))));

/** Copy primary entry-point FESM bundles to the @angular/ directory. */
task(':package:fesm', () => src(fesmGlob).pipe(dest(join(DIST_RELEASE, '@angular'))));

/** Make sure we're logged in. */
task(':publish:whoami', execTask('npm', ['whoami'], {
  silent: true,
  errMessage: 'You must be logged in to publish.'
}));

/** Create a typing file that links to the bundled definitions of NGC. */
function createTypingFile() {
  writeFileSync(join(DIST_RELEASE, 'material.d.ts'),
    LICENSE_BANNER + '\nexport * from "./typings/index";'
  );
}

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

task('publish', sequenceTask(
  ':publish:whoami',
  'build:release',
  ':publish',
  ':publish:logout',
));
