import {minimatch} from 'minimatch';
import * as Lint from 'tslint';
import ts from 'typescript';

/**
 * Rule that enforces certain decorator properties to be defined and to match a pattern.
 * Properties can be forbidden by prefixing their name with a `!`. Supports specifying a matcher for
 * filtering valid files via the third argument, as well as validating all the arguments by passing
 * in a regex. E.g.
 *
 * ```
 * "validate-decorators": [true, {
 *   "Component": {
 *     "argument": 0,
 *     "properties": {
 *       "encapsulation": "\\.None$",
 *       "!styles": ".*"
 *     }
 *   },
 *   "NgModule": {
 *      "argument": 0,
 *      "properties": "^(?!\\s*$).+"
 *    }
 * }, "src/material"]
 * ```
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile) {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

/**
 * Token used to indicate that all properties of an object
 * should be linted against a single pattern.
 */
const ALL_PROPS_TOKEN = '*';

/** Object that can be used to configured the rule. */
interface RuleConfig {
  [key: string]: {
    argument: number;
    required?: boolean;
    properties: {[key: string]: string};
    excludeFiles?: string[];
  }[];
}

/** Represents a set of required and forbidden decorator properties. */
type DecoratorRuleSet = {
  argument: number;
  required: boolean;
  requiredProps: {[key: string]: RegExp};
  forbiddenProps: {[key: string]: RegExp};
};

/** Represents a map between decorator names and rule sets. */
type DecoratorRules = {
  [decorator: string]: DecoratorRuleSet[];
};

class Walker extends Lint.RuleWalker {
  // Whether the file should be checked at all.
  private _enabled: boolean;

  // Rules that will be used to validate the decorators.
  private _rules: DecoratorRules;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);

    // Globs that are used to determine which files to exclude from linting.
    const fileGlobs: string[] = options.ruleArguments[1] || [];

    this._rules = this._generateRules(options.ruleArguments[0], sourceFile.fileName);
    this._enabled =
      Object.keys(this._rules).length > 0 &&
      !fileGlobs.some(p => minimatch(sourceFile.fileName, p));
  }

  override visitClassDeclaration(node: ts.ClassDeclaration) {
    if (this._enabled) {
      ts.getDecorators(node)?.forEach(decorator => this._validateDecorator(decorator));

      node.members.forEach(member => {
        if (
          ts.isPropertyDeclaration(member) ||
          ts.isMethodDeclaration(member) ||
          ts.isGetAccessorDeclaration(member) ||
          ts.isSetAccessorDeclaration(member)
        ) {
          ts.getDecorators(member)?.forEach(decorator => this._validateDecorator(decorator));
        }
      });
    }

    super.visitClassDeclaration(node);
  }

  /**
   * Validates that a decorator matches all of the defined rules.
   * @param decorator Decorator to be checked.
   */
  private _validateDecorator(decorator: ts.Decorator) {
    const expression = decorator.expression;

    if (!expression || !ts.isCallExpression(expression)) {
      return;
    }

    // Get the rules that are relevant for the current decorator.
    const rulesList = this._rules[expression.expression.getText()];
    const args = expression.arguments;

    // Don't do anything if there are no rules.
    if (!rulesList) {
      return;
    }

    for (const rules of rulesList) {
      const allPropsRequirement = rules.requiredProps[ALL_PROPS_TOKEN];

      // If we have a rule that applies to all properties, we just run it through once and we exit.
      if (allPropsRequirement) {
        const argumentText = args[rules.argument] ? args[rules.argument].getText() : '';
        if (!allPropsRequirement.test(argumentText)) {
          this.addFailureAtNode(
            expression.parent,
            `Expected decorator argument ${rules.argument} ` + `to match "${allPropsRequirement}"`,
          );
        }
        return;
      }

      if (!args[rules.argument]) {
        if (rules.required) {
          this.addFailureAtNode(
            expression.parent,
            `Missing required argument at index ${rules.argument}`,
          );
        }
        return;
      }

      if (!ts.isObjectLiteralExpression(args[rules.argument])) {
        return;
      }

      // Extract the property names and values.
      const props: {name: string; value: string; node: ts.PropertyAssignment}[] = [];

      (args[rules.argument] as ts.ObjectLiteralExpression).properties.forEach(prop => {
        if (ts.isPropertyAssignment(prop) && prop.name && prop.initializer) {
          props.push({
            name: prop.name.getText(),
            value: prop.initializer.getText(),
            node: prop,
          });
        }
      });

      // Find all of the required rule properties that are missing from the decorator.
      const missing = Object.keys(rules.requiredProps).filter(
        key => !props.find(prop => prop.name === key),
      );

      if (missing.length) {
        // Exit early if any of the properties are missing.
        this.addFailureAtNode(
          expression.expression,
          'Missing required properties: ' + missing.join(', '),
        );
      } else {
        // If all the necessary properties are defined, ensure that
        // they match the pattern and aren't in the forbidden list.
        props
          .filter(prop => rules.requiredProps[prop.name] || rules.forbiddenProps[prop.name])
          .forEach(prop => {
            const {name, value, node} = prop;
            const requiredPattern = rules.requiredProps[name];
            const forbiddenPattern = rules.forbiddenProps[name];

            if (requiredPattern && !requiredPattern.test(value)) {
              this.addFailureAtNode(
                node,
                `Invalid value for property. ` + `Expected value to match "${requiredPattern}".`,
              );
            } else if (forbiddenPattern && forbiddenPattern.test(value)) {
              this.addFailureAtNode(
                node,
                `Property value not allowed. ` + `Value should not match "${forbiddenPattern}".`,
              );
            }
          });
      }
    }
  }

  /**
   * Cleans out the blank rules that are passed through the tslint.json
   * and converts the string patterns into regular expressions.
   * @param config Config object passed in via the tslint.json.
   * @param filename The filename of the file being checked.
   * @returns Sanitized rules.
   */
  private _generateRules(config: RuleConfig | null, filename: string): DecoratorRules {
    const output: DecoratorRules = {};

    if (config) {
      Object.keys(config).forEach(decoratorName => {
        const decoratorConfigs = config[decoratorName];
        for (const decoratorConfig of decoratorConfigs) {
          const {argument, properties, required, excludeFiles} = decoratorConfig;

          const skip =
            excludeFiles &&
            excludeFiles.length > 0 &&
            excludeFiles.some(p => minimatch(filename, p));
          if (skip) {
            continue;
          }

          // * is a special token which means to run the pattern across the entire object.
          const allProperties = properties[ALL_PROPS_TOKEN];

          output[decoratorName] = output[decoratorName] || [];
          if (allProperties) {
            output[decoratorName].push({
              argument,
              required: !!required,
              requiredProps: {[ALL_PROPS_TOKEN]: new RegExp(allProperties)},
              forbiddenProps: {},
            });
          } else {
            output[decoratorName].push(
              Object.keys(decoratorConfig.properties).reduce(
                (rules, prop) => {
                  const isForbidden = prop.startsWith('!');
                  const cleanName = isForbidden ? prop.slice(1) : prop;
                  const pattern = new RegExp(properties[prop]);

                  if (isForbidden) {
                    rules.forbiddenProps[cleanName] = pattern;
                  } else {
                    rules.requiredProps[cleanName] = pattern;
                  }

                  return rules;
                },
                {
                  argument,
                  required: !!required,
                  requiredProps: {} as {[key: string]: RegExp},
                  forbiddenProps: {} as {[key: string]: RegExp},
                },
              ),
            );
          }
        }
      });
    }

    return output;
  }
}
