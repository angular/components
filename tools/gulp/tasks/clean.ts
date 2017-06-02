import {task} from 'gulp';
import {cleanTask} from '../util/task_helpers';
import {outputDir} from '../packaging/build-paths';


/** Deletes the dist/ directory. */
task('clean', cleanTask(outputDir));
