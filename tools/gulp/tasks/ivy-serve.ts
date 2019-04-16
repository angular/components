import {buildConfig} from '../../package-tools';
import {serverTask} from '../util/task-helpers';
import {join} from 'path';
import {task} from 'gulp';

/** Serves the previously built Ivy demo-app in the output directory. */
task('ivy-serve', serverTask(join(buildConfig.outputDir, 'ivy-demo-app')));
