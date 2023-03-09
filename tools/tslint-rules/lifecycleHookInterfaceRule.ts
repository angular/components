import ts from 'typescript';
import * as Lint from 'tslint';

const HOOKS_TO_INTERFACES: Record<string, string> = {
  'ngOnChanges': 'OnChanges',
  'ngOnInit': 'OnInit',
  'ngDoCheck': 'DoCheck',
  'ngAfterContentInit': 'AfterContentInit',
  'ngAfterContentChecked': 'AfterContentChecked',
  'ngAfterViewInit': 'AfterViewInit',
  'ngAfterViewChecked': 'AfterViewChecked',
  'ngOnDestroy': 'OnDestroy',
  'ngDoBootstrap': 'DoBootstrap',
};

/**
 * Rule that requires classes using Angular lifecycle hooks to implement the appropriate interfaces.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  override visitClassDeclaration(node: ts.ClassDeclaration) {
    for (const member of node.members) {
      if (
        !ts.isMethodDeclaration(member) ||
        !ts.isIdentifier(member.name) ||
        !HOOKS_TO_INTERFACES.hasOwnProperty(member.name.text)
      ) {
        continue;
      }

      const requiredInterface = HOOKS_TO_INTERFACES[member.name.text];
      const hasRequiredInterface = node.heritageClauses?.some(
        clause =>
          clause.token === ts.SyntaxKind.ImplementsKeyword &&
          clause.types.some(
            type =>
              ts.isExpressionWithTypeArguments(type) &&
              ts.isIdentifier(type.expression) &&
              type.expression.text === requiredInterface,
          ),
      );

      if (!hasRequiredInterface) {
        this.addFailureAtNode(
          node.name || node,
          `Class must implement interface ${requiredInterface}, because it uses Angular lifecycle hook ${member.name.text}`,
        );
      }
    }

    return super.visitClassDeclaration(node);
  }
}
