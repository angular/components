import minimatch from 'minimatch';
import * as Lint from 'tslint';
import ts from 'typescript';

/**
 * NgZone properties that are ok to access.
 */
const allowedNgZoneProperties = new Set<string>(['run', 'runOutsideAngular']);

/** Rule to prevent adding code that depends on using zones.  */
export class Rule extends Lint.Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new Walker(sourceFile, this.getOptions(), program.getTypeChecker()),
    );
  }
}

class Walker extends Lint.RuleWalker {
  /** Whether the walker should check the current source file. */
  private _enabled: boolean;

  constructor(
    sourceFile: ts.SourceFile,
    options: Lint.IOptions,
    private _typeChecker: ts.TypeChecker,
  ) {
    super(sourceFile, options);

    // Globs that are used to determine which files to lint.
    const fileGlobs: string[] = options.ruleArguments[0];

    // Whether the file should be checked at all.
    this._enabled = !fileGlobs.some(p => minimatch(sourceFile.fileName, p));
  }

  override visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    if (!this._enabled) {
      return;
    }

    const classType = this._typeChecker.getTypeAtLocation(node.expression);
    const className = classType.symbol && classType.symbol.name;
    const propertyName = node.name.text;

    if (className === 'NgZone' && !allowedNgZoneProperties.has(propertyName)) {
      this.addFailureAtNode(node, `Using NgZone.${propertyName} is not allowed.`);
    }

    return super.visitPropertyAccessExpression(node);
  }

  override visitNamedImports(node: ts.NamedImports): void {
    if (!this._enabled) {
      return;
    }

    node.elements.forEach(specifier => {
      if (specifier.name.getText() === 'provideZoneChangeDetection') {
        this.addFailureAtNode(specifier, `Using zone change detection is not allowed.`);
      }
    });
  }
}
