import {createPlugin, Rule, utils} from 'stylelint';

const isStandardSyntaxRule = require('stylelint/lib/utils/isStandardSyntaxRule');
const isStandardSyntaxSelector = require('stylelint/lib/utils/isStandardSyntaxSelector');

const ruleName = 'material/selector-no-deep';
const messages = utils.ruleMessages(ruleName, {
  expected: selector => `Usage of the /deep/ in "${selector}" is not allowed`,
});

/**
 * Stylelint plugin that prevents uses of /deep/ in selectors.
 */
const ruleFn: Rule<boolean, unknown> = isEnabled => {
  return (root, result) => {
    if (!isEnabled) {
      return;
    }

    root.walkRules(rule => {
      if (
        rule.parent?.type === 'rule' &&
        isStandardSyntaxRule(rule) &&
        isStandardSyntaxSelector(rule.selector) &&
        rule.selector.includes('/deep/')
      ) {
        utils.report({
          result,
          ruleName,
          message: messages.expected(rule.selector),
          node: rule,
        });
      }
    });
  };
};

ruleFn.ruleName = ruleName;
ruleFn.messages = messages;

export default createPlugin(ruleName, ruleFn);
