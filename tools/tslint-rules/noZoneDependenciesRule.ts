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
    private _sourceFile: ts.SourceFile,
    options: Lint.IOptions,
    private _typeChecker: ts.TypeChecker,
  ) {
    super(_sourceFile, options);

    // Globs that are used to determine which files to lint.
    const fileGlobs: string[] = options.ruleArguments[0];

    // Whether the file should be checked at all.
    this._enabled = !fileGlobs.some(p => minimatch(_sourceFile.fileName, p));
  }

  override visitIdentifier(node: ts.Identifier): void {
    if (!this._enabled) {
      return;
    }

    const symbol = this._typeChecker.getSymbolAtLocation(node);
    const decl = symbol?.valueDeclaration;
    if (decl && ts.isVariableDeclaration(decl) && decl.name.getText() === 'Zone') {
      this.addFailureAtNode(node, `Using Zone is not allowed.`);
    }
  }

  override visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    if (!this._enabled || this._sourceFile.fileName.endsWith('.spec.ts')) {
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

    if (this._sourceFile.fileName.endsWith('.spec.ts')) {
      node.elements.forEach(specifier => {
        if (specifier.name.getText() === 'NgZone' && !specifier.isTypeOnly) {
          this.addFailureAtNode(
            specifier,
            `Using NgZone is not allowed in zoneless tests. Tests that explicitly test Zone.js` +
              ` integration should go in .zone.spec.ts files.`,
          );
        }
      });
    }
  }
}
