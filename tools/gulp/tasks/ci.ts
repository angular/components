import {task} from 'gulp';


task('ci:lint', ['ci:forbidden-identifiers', 'lint']);
task('ci:test', ['test:single-run']);
task('ci:e2e', ['e2e']);
task('ci:extract-metadata', [':build:components:ngc']);
task('ci:forbidden-identifiers', function() {
  require('../../../scripts/ci/forbidden-identifiers.js');
});
