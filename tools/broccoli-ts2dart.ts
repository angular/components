/// <reference path="typings/node/node.d.ts" />
/// <reference path="typings/broccoli.d.ts" />

import fs = require('fs');
import path = require('path');
import * as ts2dart from 'ts2dart';

const mkdirp = require('mkdirp');


/**
 * Interface declaration, because broccoli-caching-writer doesn't have a .d.ts file.
 */
interface CachingWriter {
  outputPath: string;
  inputPaths: string[];

  new (inputNodes: string[], options: any);
}
type CachingWriterConstructor = { new (...args: any[]): CachingWriter };
const CACHING_WRITER_: CachingWriterConstructor = require('broccoli-caching-writer');


/**
 * Class that builds a TS file into its Dart equivalent.
 * TODO(hansl): remove this and replace it with broccoli-ts2dart from angular/angular.
 * We need to move broccoli-ts2dart outside of angular/angular, and there's a lot of external
 * dependencies so creating this was simpler.
 */
export class BroccoliTs2DartBuilder extends CACHING_WRITER_ {
  private transpiler: ts2dart.Transpiler;

  constructor(public inputNodes: string[],
              public inputFile: string,
              public outputFile: string) {
    super(inputNodes, {});
  }

  build() {
    const destFile = path.join(this.outputPath, this.outputFile);
    const destDir = path.dirname(destFile);
    const srcFile = path.join(this.inputPaths[0], this.inputFile);

    // Build and return. We instantiate the Transpiler here because the inputFile path
    // isn't known prior to this point (ie. it might be in a tmp cache).
    mkdirp.sync(destDir);
    this.transpiler = new ts2dart.Transpiler({
      basePath: path.dirname(srcFile)
    });
    this.transpiler.transpile([srcFile], destDir);
  }
}
