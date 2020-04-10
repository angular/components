const stylelint = require('stylelint');

/** Name of this stylelint rule. */;
const ruleName = 'material/theme-duplicate-styles-check';

/** Messages that can be printed out by the rule. */
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: () =>
      `Missing duplicate styles check. Please include the "${duplicateStylesMixinName}" mixin.`,
});

/** Regular expression that matches theme mixins. */
const themeMixinRegex = /^(mat-(?:mdc-)?.*)-theme\((.*)\)$/;

/** Name of the mixin that checks for duplicative theme styles. */
const duplicateStylesMixinName = `_mat-check-duplicate-theme-styles`;

/**
 * Stylelint plugin which ensures that every theme mixin includes the
 * style duplication check mixin.
 */
const plugin = stylelint.createPlugin(ruleName, (isEnabled, options, context) => {
  return (root, result) => {
    if (!isEnabled)
      return;

    root.walkAtRules('mixin', node => {
      const matches = node.params.match(themeMixinRegex);
      if (matches === null) {
        return;
      }
      const componentName = matches[1];
      const themeVariableName = matches[2];
      const expectedRuleParams =
          `${duplicateStylesMixinName}(${themeVariableName}, '${componentName}')`;
      const hasStyleDuplicationCheck = node.nodes.some(
          n => n.type === 'atrule' && n.name === 'include' && n.params === expectedRuleParams);
      // Do nothing for this mixin if it includes the duplicate styles mixin.
      if (hasStyleDuplicationCheck) {
        return;
      }
      // If autofix is enabled, insert the expected atrule as first node of the theme mixin.
      if (context.fix) {
        node.insertBefore(0, {name: 'include', params: expectedRuleParams});
        return;
      }
      // Report an error if the duplicate styles mixin is not included in the theme mixin.
      stylelint.utils.report({
        result,
        ruleName,
        node,
        message: messages.expected(),
      });
    });
  };
});

plugin.ruleName = ruleName;
plugin.messages = messages;
module.exports = plugin;
