import gulp = require('gulp');
import {execTask} from '../task_helpers';


gulp.task('lint', ['tslint', 'stylelint']);

gulp.task('tslint', execTask('tslint', ['-c', 'tslint.json', 'src/**/*.ts']));

gulp.task('stylelint', execTask(
  'stylelint', ['src/**/*.scss', '--config', 'stylelint-config.json', '--syntax', 'scss']
));
