import {task} from 'gulp';
import {DIST_DEMOAPP, SOURCE_ROOT} from '../constants';
import {sequenceTask} from '../util/task_helpers';
import {join} from 'path';
import {Program, CompilerHost} from 'typescript';
import {
  main as tsc, CodeGenerator, AngularCompilerOptions, NgcCliOptions
} from '@angular/compiler-cli';

const tsconfigFile = join(SOURCE_ROOT, 'demo-app', 'tsconfig-aot.json');

/** Builds the demo-app and library. To be able to run NGC, apply the metadata workaround. */
task('aot:deps', sequenceTask('build:devapp', 'library:build:fix-metadata'));

/** After building the demo-app, run the Angular compiler to verify that all components work. */
task('aot:build', ['aot:deps'], () => runAngularCompiler());

/**
 * Angular does not expose a public function to run the Angular compiler.
 * Creating the CodeGenerator from NGC and using it inside of tsc-wrapped is the same. */
function runAngularCompiler() {
  return tsc(tsconfigFile, {basePath: DIST_DEMOAPP}, codegen);
}

/**
 * Codgen function from the @angular/compiler-cli package.
 * See: https://github.com/angular/angular/blob/master/packages/compiler-cli/src/main.ts
 */
function codegen(ngOptions: AngularCompilerOptions, cliOptions: NgcCliOptions, program: Program,
    host: CompilerHost) {
  return CodeGenerator.create(ngOptions, cliOptions, program, host).codegen();
}
