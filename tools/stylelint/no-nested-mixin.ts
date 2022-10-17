import {createPlugin, Rule, utils} from 'stylelint';

const ruleName = 'material/no-nested-mixin';
const messages = utils.ruleMessages(ruleName, {
  expected: () => 'Nested mixins are not allowed.',
});

/**
 * Stylelint plugin that prevents nesting Sass mixins.
 */
const ruleFn: Rule<boolean, unknown> = isEnabled => {
  return (root, result) => {
    if (!isEnabled) {
      return;
    }

    root.walkAtRules(rule => {
      if (rule.name !== 'mixin') {
        return;
      }

      rule.walkAtRules(childRule => {
        if (childRule.name !== 'mixin') {
          return;
        }

        utils.report({
          result,
          ruleName,
          message: messages.expected(),
          node: childRule,
        });
      });
    });
  };
};

ruleFn.ruleName = ruleName;
ruleFn.messages = messages;

export default createPlugin(ruleName, ruleFn);
