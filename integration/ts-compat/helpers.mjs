import path from 'path';
import shelljs from 'shelljs';
import {fork} from 'child_process';

// Exit if any command fails.
shelljs.set('-e');

// Path to the generated file that imports all entry-points.
const testFilePath = path.resolve('./import-all-entry-points.ts');

/**
 * Runs the TypeScript compatibility test with the specified tsc binary. The
 * compatibility test, links the built release packages into `node_modules` and
 * compiles a test file using the specified tsc binary which imports all entry-points.
 */
export async function runTypeScriptCompatibilityTest(tscBinPath) {
  return new Promise((resolve, reject) => {
    const tscArgs = [
      '--strict',
      // Disables automatic type resolution. In non-sandbox environments, the node modules
      // are accessible and types could end up as part of the program.
      '--types',
      '--lib',
      'es2015,dom',
      testFilePath,
    ];
    // Run `tsc` to compile the project. The stdout/stderr output is inherited, so that
    // warnings and errors are printed to the console.
    const tscProcess = fork(tscBinPath, tscArgs, {stdio: 'inherit'});

    tscProcess.on('exit', exitCode => {
      exitCode === 0 ? resolve() : reject();
    });
  });
}
