/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {FileSystem, WorkspacePath} from '../file-system';
import {FileSystemHost} from './virtual-host';
import {dirname} from 'path';
import {formatDiagnostics} from './diagnostics';

/** Code of the error raised by TypeScript when a tsconfig doesn't match any files. */
const NO_INPUTS_ERROR_CODE = 18003;

/** Class capturing a tsconfig parse error. */
export class TsconfigParseError extends Error {}

/**
 * Attempts to parse the specified tsconfig file.
 *
 * @throws {TsconfigParseError} If the tsconfig could not be read or parsed.
 */
export function parseTsconfigFile(
  tsconfigPath: WorkspacePath,
  fileSystem: FileSystem,
): ts.ParsedCommandLine {
  if (!fileSystem.fileExists(tsconfigPath)) {
    throw new TsconfigParseError(`Tsconfig cannot not be read: ${tsconfigPath}`);
  }

  const {config, error} = ts.readConfigFile(
    tsconfigPath,
    p => fileSystem.read(fileSystem.resolve(p))!,
  );

  // If there is a config reading error, we never attempt to parse the config.
  if (error) {
    throw new TsconfigParseError(formatDiagnostics([error], fileSystem));
  }

  const parsed = ts.parseJsonConfigFileContent(
    config,
    new FileSystemHost(fileSystem),
    dirname(tsconfigPath),
    {},
  );

  // Skip the "No inputs found..." error since we don't want to interrupt the migration if a
  // tsconfig doesn't match a file. This will result in an empty `Program` which is still valid.
  const errors = parsed.errors.filter(diag => diag.code !== NO_INPUTS_ERROR_CODE);

  if (errors.length) {
    throw new TsconfigParseError(formatDiagnostics(errors, fileSystem));
  }

  return parsed;
}
