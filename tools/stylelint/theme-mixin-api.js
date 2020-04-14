const stylelint = require('stylelint');

/** Name of this stylelint rule. */
const ruleName = 'material/theme-mixin-api';

/** Regular expression that matches all theme mixins. */
const themeMixinRegex =
    /^(?:_(mat-.+)-(density)|(mat-.+)-(density|color|typography|theme))\(([^,]+)\)$/;

/**
 * Stylelint plugin which ensures that theme mixins have a consistent API. Besides
 * compilation API tests which are stored in `src/material/core/theming/test`, we test
 * the following patterns here:
 *
 *   1. Checks if theme mixin arguments named consistently e.g. if a mixin accepts both a theme
 *      or color configuration, the variable should reflect that.
 *   2. Checks if the individual theme mixins handle the case where consumers pass a theme object.
 *      For convenience, we support passing theme object to the scoped mixins.
 *   3. Checks if the `-theme` mixins have the duplicate style check set up. We want to
 *      consistently check for duplicative theme styles so that we can warn consumers.
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

      const componentName = matches[1] || matches[3];
      const type = matches[2] ||matches[4];
      const variableName = matches[5];

      if (type === 'theme') {
        validateThemeMixin(node, componentName, variableName);
      } else {
        validateIndividualSystemMixins(node, type, variableName);
      }
    });

    function validateThemeMixin(node, componentName, variableName) {
      if (variableName !== '$theme-or-color-config') {
        if (context.fix) {
          node.params = node.params.replace(variableName, '$theme-or-color-config');
        } else {
          reportError(node, 'Expected mixin argument to be called `$theme-or-color-config`.');
        }
      }

      const themePropName = `$theme`;
      const legacyColorExtractExpr = `_mat-legacy-get-theme($theme-or-color-config)`;
      const duplicateStylesCheckExpr =
          `_mat-check-duplicate-theme-styles(${themePropName}, '${componentName}')`;
      const isLegacyColorConfigHandled = node.nodes.find(n => n.type === 'decl' &&
          n.prop === themePropName && n.value === legacyColorExtractExpr);
      const hasDuplicateStylesCheck = node.nodes.find(n => n.type === 'atrule' &&
          n.name === 'include' && n.params === duplicateStylesCheckExpr);

      if (!isLegacyColorConfigHandled) {
        if (context.fix) {
          node.insertBefore(0, {prop: themePropName, value: legacyColorExtractExpr});
        } else {
          reportError(node, `Legacy color API is not handled. Consumers could pass in a ` +
              `color configuration directly to the theme mixin. For backwards compatibility, ` +
              `use "_mat-legacy-get-theme(...)" to retrieve the theme object.`);
        }
      }

      if (!hasDuplicateStylesCheck) {
        if (context.fix) {
          node.insertBefore(0, {name: 'include', params: duplicateStylesCheckExpr});
        } else {
          reportError(node, `Missing check for duplicative theme styles. Please include the ` +
              `"_mat-check-duplicate-theme-styles(...)" mixin.: `);
        }
      }
    }

    function validateIndividualSystemMixins(node, type, variableName) {
      if (variableName !== '$config-or-theme') {
        if (context.fix) {
          node.params = node.params.replace(variableName, '$config-or-theme');
        } else {
          reportError(node, 'Expected mixin argument to be called `$config-or-theme`.');
        }
      }

      const expectedProperty = type === 'density' ? '$density-scale' : '$config';
      const expectedValue = `mat-get-${type}-config($config-or-theme)`;
      const isConfigExtracted = node.nodes.find(n => n.type === 'decl' &&
          n.prop === expectedProperty && n.value === expectedValue);

      if (!isConfigExtracted) {
        if (context.fix) {
          node.insertBefore(0, {prop: expectedProperty, value: expectedValue});
        } else {
          reportError(node, `Config is not extracted. Consumers could pass a theme object. ` +
              `Extract the configuration by using: $config: ${expectedValue}`);
        }
      }
    }

    function reportError(node, message) {
      stylelint.utils.report({result, ruleName, node, message});
    }
  };
});

plugin.ruleName = ruleName;
module.exports = plugin;
