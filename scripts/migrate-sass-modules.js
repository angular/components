const childProcess = require('child_process');
const path = require('path');
const fs = require('fs');
const {sync: glob} = require('glob');

const directory = path.join(__dirname, '../src');
const migratedFiles = new Set();
const ignorePatterns = [
  '**/*.import.scss',
  '**/test-theming-bundle.scss',
  'material/_theming.scss'
];
const materialPrefixes = [
  ...getPrefixes('material', 'mat'),
  ...getPrefixes('material/core', 'mat'),
  // Outliers that don't have a directory of their own.
  'mat-pseudo-checkbox-',
  'mat-elevation-',
  'mat-optgroup-',
  'mat-private-'
];
const mdcPrefixes = [
  ...getPrefixes('material-experimental', 'mat'),
  ...getPrefixes('material-experimental/mdc-core', 'mat'),
  // Outliers that don't have a directory of their own.
  'mat-mdc-optgroup-'
].map(prefix => prefix === 'mat-' ? 'mat-mdc-' : prefix);
const cdkPrefixes = getPrefixes('cdk', 'cdk');
const cdkExperimentalPrefixes = getPrefixes('cdk-experimental', 'cdk');

// Restore the source directory to a clean state.
run('git', ['clean', '-f', '-d'], false, true);
run('git', ['checkout', '--', directory], false, true);

// --reset is a utility to easily restore the repo to its initial state.
if (process.argv.indexOf('--reset') > -1) {
  process.exit(0);
}

// Run the migrations.

// Migrate all the partials and forward any export symbols.
migrate('cdk/**/_*.scss', cdkPrefixes, true);
migrate('cdk-experimental/**/_*.scss', cdkExperimentalPrefixes, true);
migrate('material/core/**/_*.scss', materialPrefixes, true, ['**/_all-*.scss', '**/_core.scss']);
migrate('material/!(core)/**/_*.scss', materialPrefixes, true);
migrate('material/core/**/_*.scss', materialPrefixes, true);

// Comment out all MDC imports since the migrator script doesn't know how to find them.
commentOutMdc('material-experimental/**/*.scss');

// Migrate all of the MDC partials.
migrate('material-experimental/mdc-helpers/**/_*.scss', mdcPrefixes, true);
migrate('material-experimental/mdc-core/**/_*.scss', mdcPrefixes, true, ['**/_core.scss']);
migrate('material-experimental/**/_*.scss', mdcPrefixes, true);

// Migrate everything else without forwarding.
migrate('cdk/**/*.scss', cdkPrefixes);
migrate('cdk-experimental/**/*.scss', cdkExperimentalPrefixes);
migrate('material/**/*.scss', materialPrefixes);
migrate('material-experimental/**/*.scss', mdcPrefixes);

// Migrate whatever is left in the source files, assuming that it's not a public API.
migrate('**/*.scss');

// Restore the commented out MDC imports and sort `@use` above `@import`.
restoreAndSortMdc('material-experimental/**/*.scss');

// Clear the files that we don't want.
clearUnwatedFiles();

// Try to auto-fix some of the lint issues.
run('yarn', ['stylelint', '--fix'], true, true);
console.log(`Finished migrating ${migratedFiles.size} files.`);

function migrate(pattern, prefixes = [], forward = false, ignore = []) {
  const args = ['module'];
  forward && args.push('--forward=import-only');
  prefixes.length && args.push(`--remove-prefix=${prefixes.join(',')}`);

  // Note that while the migrator allows for multiple files to be passed in, we start getting
  // some assertion errors along the way. Running it on a file-by-file basis works fine.
  const files = glob(pattern, {cwd: directory, ignore: [...ignore, ...ignorePatterns]})
    .filter(file => !migratedFiles.has(file));
  const message = `Migrating ${files.length} unmigrated files matching ${pattern}.`;
  console.log(ignore.length ? message + ` Ignoring ${ignore.join(', ')}.` : message);
  run('sass-migrator', [...args, ...files]);
  files.forEach(file => migratedFiles.add(file));
}

function run(name, args, canFail = false, silent = false) {
  const result = childProcess.spawnSync(name, args, {shell: true, cwd: directory});
  const output = result.stdout.toString();
  !silent && output.length && console.log(output);

  if (result.status !== 0 && !canFail) {
    console.error(`Script error: ${(result.stderr || result.stdout)}`);
    process.exit(1);
  }
}

function getPrefixes(package, prefix) {
  return fs.readdirSync(path.join(directory, package), {withFileTypes: true})
      .filter(current => current.isDirectory())
      .map(current => current.name)
      .reduce((output, current) => [`${prefix}-${current}-`, ...output], [`${prefix}-`]);
}

function commentOutMdc(pattern) {
  const files = glob(pattern, {cwd: directory, absolute: true});
  console.log(`Commenting out @material imports from ${files.length} files matching ${pattern}.`);
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Prefix the content with a marker so we know what to restore later.
    fs.writeFileSync(file, content.replace(/(@use|@import) '@material/g, m => '//🚀 ' + m));
  });
}

function restoreAndSortMdc(pattern) {
  const files = glob(pattern, {cwd: directory, absolute: true});
  console.log(`Re-adding and sorting @material imports from ${files.length} ` +
              `files matching ${pattern}.`);

  files.forEach(file => {
    // Remove the commented out lines with the marker from `commentOutMdc`.
    const content = fs.readFileSync(file, 'utf8').replace(/\/\/🚀 /g, '');
    const lines = content.split('\n');
    let headerStartIndex = -1;
    let headerEndIndex = -1;

    // Find where the comments start and end.
    for (let i = lines.length - 1; i > -1; i--) {
      if (lines[i].startsWith('@use') || lines[i].startsWith('@import')) {
        headerStartIndex = i;

        if (headerEndIndex === -1) {
          headerEndIndex = i + 1;
        }
      }
    }

    // Sort the imports so that `@use` comes before `@import`. Otherwise Sass will throw an error.
    if (headerStartIndex > -1 && headerEndIndex > -1) {
      const headers = lines
        .splice(headerStartIndex, headerEndIndex - headerStartIndex)
        .sort((a, b) => a.startsWith('@use') && !b.startsWith('@use') ? -1 : 0);
      lines.splice(headerStartIndex, 0, ...headers);
    }

    fs.writeFileSync(file, lines.join('\n'));
  });
}

function clearUnwatedFiles() {
  // The migration script generates .import files even if we don't pass in the `--forward` when
  // a file has top-level variables matching a prefix. Since we still want such files to be
  // migrated, we clear the unwanted files afterwards.
  const files = glob('**/*.import.scss', {cwd: directory,  absolute: true, ignore: ['**/_*.scss']});
  console.log(`Clearing ${files.length} unwanted files.`);
  files.forEach(file => fs.unlinkSync(file));
}
