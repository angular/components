import {task} from 'gulp';
const gulp = require('gulp');

task('default', ['help']);

task('help', function() {
  const taskList = Object.keys(gulp.tasks)
    .filter(x => !x.startsWith(':'))
    .filter(x => !x.startsWith('ci:'))
    .filter(x => x != 'default')
    .sort();

  console.log(`\nHere's a list of supported tasks:\n   `, taskList.join('\n    '));
  console.log(`\nYou're probably looking for "test" or "serve:devapp".\n\n`);
});

