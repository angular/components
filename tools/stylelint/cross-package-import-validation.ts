import {createPlugin, Rule, utils} from 'stylelint';
import {dirname, relative, join} from 'path';

const ruleName = 'material/cross-package-import-validation';
const messages = utils.ruleMessages(ruleName, {
  forbidden: (targetPackage, importPath) =>
    `Relative reference to separate NPM package "${targetPackage}" is not allowed. ` +
    `Use a module specifier instead of "${importPath}".`,
  noDeepCrossPackageModuleImport: importSpecifier =>
    `Deep cross-package module imports are not allowed ("${importSpecifier}").`,
});

const specifierRegex = /^["']([^"']+)["']/;
const packageNameRegex = /^src\/([^/]+)/;
const projectDir = join(__dirname, '../../');

/** Stylelint plugin that flags forbidden cross-package relative imports. */
const ruleFn: Rule<boolean, unknown> = isEnabled => {
  return (root, result) => {
    if (!isEnabled) {
      return;
    }

    root.walkAtRules(rule => {
      if (rule.name === 'use' || rule.name === 'import' || rule.name === 'forward') {
        const [_, specifier] = rule.params.match(specifierRegex)!;

        // Ensure no deep imports for cross-package `@angular/` imports.
        if (/@angular\/[^/]+\//.test(specifier)) {
          utils.report({
            result,
            ruleName,
            message: messages.noDeepCrossPackageModuleImport(specifier),
            node: rule,
          });
          return;
        }

        // Skip the cross-package relative import check for module imports.
        if (!specifier.startsWith('.')) {
          return;
        }

        const currentPath = convertToProjectRelativePosixPath(root.source!.input.file!);
        const targetPath = convertToProjectRelativePosixPath(
          join(dirname(root.source!.input.file!), specifier),
        );

        const owningFilePackage = currentPath.match(packageNameRegex)![1];
        const targetFilePackage = targetPath.match(packageNameRegex)![1];

        if (owningFilePackage !== targetFilePackage) {
          utils.report({
            result,
            ruleName,
            message: messages.forbidden(targetFilePackage, specifier),
            node: rule,
          });
        }
      }
    });
  };
};

ruleFn.ruleName = ruleName;
ruleFn.messages = messages;

/** Converts the specified absolute path to a project relative POSIX path. */
function convertToProjectRelativePosixPath(fileName: string): string {
  return relative(projectDir, fileName).replace(/[/\\]/g, '/');
}

export default createPlugin(ruleName, ruleFn);
