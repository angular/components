import ts from 'typescript';
import * as Lint from 'tslint';

/**
 * Rule that enforces that we use plain `enum` rather than `const enum`.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  override visitEnumDeclaration(node: ts.EnumDeclaration) {
    if (node.modifiers?.some(({kind}) => kind === ts.SyntaxKind.ConstKeyword)) {
      this.addFailureAtNode(node.name, 'Const enums are not allowed! Prefer plain `enum` instead.');
    }

    super.visitEnumDeclaration(node);
  }
}
