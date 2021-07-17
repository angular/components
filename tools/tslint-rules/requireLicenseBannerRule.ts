import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as minimatch from 'minimatch';

const buildConfig = require('../../build-config');

/** License banner that is placed at the top of every public TypeScript file. */
const licenseBanner = buildConfig.licenseBanner;

/** Failure message that will be shown if a license banner is missing. */
const ERROR_MESSAGE = 'Missing license header in this TypeScript file. ' +
  'Every TypeScript file of the library needs to have the Google license banner at the top.';

/** TSLint fix that can be used to add the license banner easily. */
const tslintFix = Lint.Replacement.appendText(0, licenseBanner + '\n\n');

/**
 * Rule that walks through all TypeScript files of public packages and shows failures if a
 * file does not have the license banner at the top of the file.
 */
export class Rule extends Lint.Rules.AbstractRule {

  apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(new RequireLicenseBannerWalker(sourceFile, this.getOptions()));
  }
}

class RequireLicenseBannerWalker extends Lint.RuleWalker {

  /** Whether the walker should check the current source file. */
  private _enabled: boolean;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);

    // Globs that are used to determine which files to lint.
    const fileGlobs = options.ruleArguments;

    // Since tslint resolved file names are lowercase when working on a case insensitive
    // filesystem, we need to transform the current working directory and the source
    // file name to the real native paths using fs.realpathSync.native function.
    const cwd = fs.realpathSync.native(process.cwd());
    const fileName = fs.realpathSync.native(sourceFile.fileName);

    // Relative path for the current TypeScript source file.
    const relativeFilePath = path.relative(cwd, fileName);

    // Whether the file should be checked at all.
    this._enabled = fileGlobs.some(p => minimatch(relativeFilePath, p));
  }

  override visitSourceFile(sourceFile: ts.SourceFile) {
    if (!this._enabled) {
      return;
    }

    const fileContent = sourceFile.getFullText();
    const licenseCommentPos = fileContent.indexOf(licenseBanner);

    if (licenseCommentPos !== 0) {
      return this.addFailureAt(0, 0, ERROR_MESSAGE, tslintFix);
    }

    super.visitSourceFile(sourceFile);
  }
}
