/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** All functions whose names have been prefixed with `m2-` in v18. */
const RENAMED_FUNCTIONS = [
  'define-light-theme',
  'define-dark-theme',
  'define-palette',
  'get-contrast-color-from-palette',
  'get-color-from-palette',
  'get-color-config',
  'get-typography-config',
  'get-density-config',
  'define-typography-level',
  'define-rem-typography-config',
  'define-typography-config',
  'define-legacy-typography-config',
  'typography-level',
  'font-size',
  'line-height',
  'font-weight',
  'letter-spacing',
  'font-family',
];

/** All variables whose names have been prefixed with `m2-` in v18. */
const RENAMED_VARIABLES = [
  'red-palette',
  'pink-palette',
  'indigo-palette',
  'purple-palette',
  'deep-purple-palette',
  'blue-palette',
  'light-blue-palette',
  'cyan-palette',
  'teal-palette',
  'green-palette',
  'light-green-palette',
  'lime-palette',
  'yellow-palette',
  'amber-palette',
  'orange-palette',
  'deep-orange-palette',
  'brown-palette',
  'grey-palette',
  'gray-palette',
  'blue-grey-palette',
  'blue-gray-palette',
  'light-theme-background-palette',
  'dark-theme-background-palette',
  'light-theme-foreground-palette',
  'dark-theme-foreground-palette',
];

/** M3 theming functions that were moved into stable. */
const M3_FUNCTIONS = ['define-theme', 'define-colors', 'define-typography', 'define-density'];

/** M3 variables that were moved into stable. */
const M3_VARIABLES = [
  'red-palette',
  'green-palette',
  'blue-palette',
  'yellow-palette',
  'cyan-palette',
  'magenta-palette',
  'orange-palette',
  'chartreuse-palette',
  'azure-palette',
  'violet-palette',
  'rose-palette',
];

/** Possible pairs of comment characters in a Sass file. */
const COMMENT_PAIRS = new Map<string, string>([
  ['/*', '*/'],
  ['//', '\n'],
]);

/** Prefix for the placeholder that will be used to escape comments. */
const COMMENT_PLACEHOLDER_START = '__<<ngM2ThemingMigrationEscapedComment';

/** Suffix for the comment escape placeholder. */
const COMMENT_PLACEHOLDER_END = '>>__';

/** Replaces all usages of renamed M2 theming APIs in a file. */
export function migrateM2ThemingApiUsages(fileContent: string): string {
  // Strip out comments, so they don't confuse our migration.
  let {content, placeholders} = escapeComments(fileContent);
  const materialNamespaces = getNamespaces('@angular/material', content);
  const experimentalNamespaces = getNamespaces('@angular/material-experimental', content);

  // Migrate the APIs whose names were prefixed with `m2-`.
  for (const namespace of materialNamespaces) {
    for (const name of RENAMED_FUNCTIONS) {
      content = migrateFunction(content, namespace, name, namespace, 'm2-' + name);
    }

    for (const name of RENAMED_VARIABLES) {
      content = migrateVariable(content, namespace, name, namespace, 'm2-' + name);
    }
  }

  // Migrate themes that were using M3 while it was still in experimental.
  if (experimentalNamespaces.length > 0) {
    const preExperimentalContent = content;
    const stableNamespace = materialNamespaces.length === 0 ? 'mat' : materialNamespaces[0];

    for (const namespace of experimentalNamespaces) {
      // The only mixin that was renamed was the backwards-compatibility one.
      content = migrateMixin(
        content,
        namespace,
        'color-variants-back-compat',
        stableNamespace,
        'color-variants-backwards-compatibility',
      );

      // M3 functions weren't prefixed with anything
      // so they just move over to the new namespace.
      for (const name of M3_FUNCTIONS) {
        content = migrateFunction(content, namespace, name, stableNamespace, name);
      }

      // Variables were all prefixed with `m3-` which needs to be stripped.
      for (const name of M3_VARIABLES) {
        content = migrateVariable(content, namespace, 'm3-' + name, stableNamespace, name);
      }
    }

    // If experimental is imported, but Material isn't, insert a new import at the top.
    // This should be rare since `@angular/material` was still required for the theme.
    if (materialNamespaces.length === 0 && content !== preExperimentalContent) {
      content = `@use '@angular/material' as ${stableNamespace};\n` + content;
    }
  }

  return restoreComments(content, placeholders);
}

/** Renames all usages of a Sass function in a file. */
function migrateFunction(
  fileContent: string,
  oldNamespace: string,
  oldName: string,
  newNamespace: string,
  newName: string,
): string {
  return fileContent.replace(
    new RegExp(`${oldNamespace}\\.${oldName}\\(`, 'g'),
    `${newNamespace}.${newName}(`,
  );
}

/** Renames all usages of a Sass variable in a file. */
function migrateVariable(
  fileContent: string,
  oldNamespace: string,
  oldName: string,
  newNamespace: string,
  newName: string,
): string {
  return fileContent.replace(
    new RegExp(`${oldNamespace}\\.\\$${oldName}(?!\\s+:|[-_a-zA-Z0-9:])`, 'g'),
    `${newNamespace}.$${newName}`,
  );
}

/** Renames all usages of a Sass mixin in a file. */
function migrateMixin(
  fileContent: string,
  oldNamespace: string,
  oldName: string,
  newNamespace: string,
  newName: string,
): string {
  const pattern = new RegExp(`@include +${oldNamespace}\\.${oldName}`, 'g');
  return fileContent.replace(pattern, `@include ${newNamespace}.${newName}`);
}

/**
 * Replaces all the comments in a Sass file with placeholders and
 * returns the list of placeholders, so they can be restored later.
 */
function escapeComments(content: string): {content: string; placeholders: Record<string, string>} {
  const placeholders: Record<string, string> = {};
  let commentCounter = 0;
  let [openIndex, closeIndex] = findComment(content);

  while (openIndex > -1 && closeIndex > -1) {
    const placeholder = COMMENT_PLACEHOLDER_START + commentCounter++ + COMMENT_PLACEHOLDER_END;
    placeholders[placeholder] = content.slice(openIndex, closeIndex);
    content = content.slice(0, openIndex) + placeholder + content.slice(closeIndex);
    [openIndex, closeIndex] = findComment(content);
  }

  return {content, placeholders};
}

/** Finds the start and end index of a comment in a file. */
function findComment(content: string): [openIndex: number, closeIndex: number] {
  // Add an extra new line at the end so that we can correctly capture single-line comments
  // at the end of the file. It doesn't really matter that the end index will be out of bounds,
  // because `String.prototype.slice` will clamp it to the string length.
  content += '\n';

  for (const [open, close] of COMMENT_PAIRS.entries()) {
    const openIndex = content.indexOf(open);

    if (openIndex > -1) {
      const closeIndex = content.indexOf(close, openIndex + 1);
      return closeIndex > -1 ? [openIndex, closeIndex + close.length] : [-1, -1];
    }
  }

  return [-1, -1];
}

/** Restores the comments that have been escaped by `escapeComments`. */
function restoreComments(content: string, placeholders: Record<string, string>): string {
  Object.keys(placeholders).forEach(key => (content = content.replace(key, placeholders[key])));
  return content;
}

/** Parses out the namespace from a Sass `@use` statement. */
function extractNamespaceFromUseStatement(fullImport: string): string {
  const closeQuoteIndex = Math.max(fullImport.lastIndexOf(`"`), fullImport.lastIndexOf(`'`));

  if (closeQuoteIndex > -1) {
    const asExpression = 'as ';
    const asIndex = fullImport.indexOf(asExpression, closeQuoteIndex);

    // If we found an ` as ` expression, we consider the rest of the text as the namespace.
    if (asIndex > -1) {
      return fullImport
        .slice(asIndex + asExpression.length)
        .split(';')[0]
        .trim();
    }

    // Otherwise the namespace is the name of the file that is being imported.
    const lastSlashIndex = fullImport.lastIndexOf('/', closeQuoteIndex);

    if (lastSlashIndex > -1) {
      const fileName = fullImport
        .slice(lastSlashIndex + 1, closeQuoteIndex)
        // Sass allows for leading underscores to be omitted and it technically supports .scss.
        .replace(/^_|(\.import)?\.scss$|\.import$/g, '');

      // Sass ignores `/index` and infers the namespace as the next segment in the path.
      if (fileName === 'index') {
        const nextSlashIndex = fullImport.lastIndexOf('/', lastSlashIndex - 1);

        if (nextSlashIndex > -1) {
          return fullImport.slice(nextSlashIndex + 1, lastSlashIndex);
        }
      } else {
        return fileName;
      }
    }
  }

  throw Error(`Could not extract namespace from import "${fullImport}".`);
}

/** Gets all the namespaces that a module is available under in a specific file. */
function getNamespaces(moduleName: string, content: string): string[] {
  const namespaces = new Set<string>();
  const escapedName = moduleName.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  const pattern = new RegExp(`@use +['"]${escapedName}['"].*;?\\r?\\n`, 'g');
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(content))) {
    namespaces.add(extractNamespaceFromUseStatement(match[0]));
  }

  return Array.from(namespaces);
}
