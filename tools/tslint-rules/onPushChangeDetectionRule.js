const Lint = require('tslint');
const ERROR_MESSAGE = 'Components must use OnPush change detection.';

/**
 * Rule that enforces that OnPush change detection is used on all @Component declarations.
 * Files can be whitelisted via `"on-push-change-detection": [true, "\.spec\.ts$"]`.
 */
class Rule extends Lint.Rules.AbstractRule {
  apply(file) {
    return this.applyWithWalker(new Walker(file, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  constructor(file, options) {
    super(...arguments);

    // Whitelist with regular expressions to use when determining which files to lint.
    const whitelist = options.ruleArguments;

    // Whether the file should be checked at all.
    this._enabled = !whitelist.length || whitelist.some(p => new RegExp(p).test(file.fileName));
  }

  visitClassDeclaration(node) {
    if (!this._enabled || !node.decorators) return;

    node.decorators
      .map(decorator => decorator.expression)
      .filter(expression => expression.expression.getText() === 'Component')
      .filter(expression => expression.arguments.length && expression.arguments[0].properties)
      .forEach(expression => {
        const hasOnPushChangeDetection = expression.arguments[0].properties.some(prop => {
          const value = prop.initializer.getText();
          return prop.name.getText() === 'changeDetection' && value.endsWith('.OnPush');
        });

        if (!hasOnPushChangeDetection) {
          this.addFailureAtNode(expression.parent, ERROR_MESSAGE);
        }
      });
  }

}

exports.Rule = Rule;
