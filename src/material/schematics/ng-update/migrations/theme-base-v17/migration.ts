/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Preamble to insert before the missing mixins. */
const MISSING_MIXIN_PREAMBLE_LINES = `
// The following mixins include base theme styles that are only needed once per application. These
// theme styles do not depend on the color, typography, or density settings in your theme. However,
// these styles may differ depending on the theme's design system. Currently all themes use the
// Material 2 design system, but in the future it may be possible to create theme based on other
// design systems, such as Material 3.
//
// Please note: you do not need to include the 'base' mixins, if you include the corresponding
// 'theme' mixin elsewhere in your Sass. The full 'theme' mixins already include the base styles.
//
// To learn more about "base" theme styles visit our theming guide:
// https://material.angular.io/guide/theming#theming-dimensions
//
// TODO(v17): Please move these @include statements to the preferred place in your Sass, and pass
// your theme to them. This will ensure the correct values for your app are included.\
`.split('\n');

/** The sets of theme mixins to check for. */
const THEME_MIXIN_SETS: {
  theme: string;
  color: string;
  typography: string;
  density: string;
  base: string;
}[] = [
  {
    theme: 'all-component-themes',
    color: 'all-component-colors',
    typography: 'all-component-typographies',
    density: 'all-component-densities',
    base: 'all-component-bases',
  },
  ...[
    'core',
    'card',
    'progress-bar',
    'tooltip',
    'form-field',
    'input',
    'select',
    'autocomplete',
    'dialog',
    'chips',
    'slide-toggle',
    'radio',
    'slider',
    'menu',
    'list',
    'paginator',
    'tabs',
    'checkbox',
    'button',
    'icon-button',
    'fab',
    'snack-bar',
    'table',
    'progress-spinner',
    'badge',
    'bottom-sheet',
    'button-toggle',
    'datepicker',
    'divider',
    'expansion',
    'grid-list',
    'icon',
    'sidenav',
    'stepper',
    'sort',
    'toolbar',
    'tree',
  ].map(comp => ({
    theme: `${comp}-theme`,
    color: `${comp}-color`,
    typography: `${comp}-typography`,
    density: `${comp}-density`,
    base: `${comp}-base`,
  })),
];

/** Possible pairs of comment characters in a Sass file. */
const COMMENT_PAIRS = new Map<string, string>([
  ['/*', '*/'],
  ['//', '\n'],
]);

/** Prefix for the placeholder that will be used to escape comments. */
const COMMENT_PLACEHOLDER_START = '__<<ngThemingMigrationEscapedComment';

/** Suffix for the comment escape placeholder. */
const COMMENT_PLACEHOLDER_END = '>>__';

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

/** Escapes special regex characters in a string. */
function escapeRegExp(str: string): string {
  return str.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
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

/** Gets the set of namespaces that the given import path is aliased to by @use. */
function getAtUseNamespaces(content: string, path: string) {
  const namespaces = new Set<string>();
  const pattern = new RegExp(`@use +['"]~?${escapeRegExp(path)}['"].*;?\n`, 'g');
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(content))) {
    namespaces.add(extractNamespaceFromUseStatement(match[0]));
  }

  return namespaces;
}

/** Gets a list of matches representing where the given mixin is included with `@include`. */
function getAtIncludes(content: string, namespace: string, mixin: string): RegExpMatchArray[] {
  // The ending checks what comes after the mixin name. We need to check that we don't see a word
  // character or `-` immediately following the mixin name, as that would change the name. Beyond
  // that character we can match anything, to the end of the line.
  const ending = '([^\\n\\w-][^\\n]*)?($|\\n)';
  const pattern = new RegExp(
    `@include\\s+${escapeRegExp(namespace)}\\.${escapeRegExp(mixin)}${ending}`,
    'g',
  );
  return [...content.matchAll(pattern)];
}

/** Checks whether the given mixin is included with `@include`. */
function isMixinAtIncluded(content: string, namespace: string, mixin: string) {
  return !!getAtIncludes(content, namespace, mixin).length;
}

/** Inserts the given lines after the match point. */
function insertLinesAfterMatch(content: string, match: RegExpMatchArray, lines: string[]): string {
  const insertionPoint = match.index! + match[0].length;
  return (
    content.substring(0, insertionPoint) +
    lines.join('\n') +
    '\n' +
    content.substring(insertionPoint)
  );
}

/** Gets the indentation at the given line in the content. */
function getIndentation(content: string, index: number) {
  let indentationStart = 0;
  let indentationEnd = index;
  for (let i = index; i >= 0; i--) {
    if (content[i] === '\n') {
      indentationStart = i + 1;
      break;
    }
    if (!/\s/.exec(content[i])) {
      indentationEnd = i;
    }
  }
  return content.slice(indentationStart, indentationEnd);
}

/** Gets the lines to insert to address the missing mixins. */
function getMissingMixinLines(namespace: string, mixins: Set<string>, indentation: string) {
  return [
    ...MISSING_MIXIN_PREAMBLE_LINES,
    ...[...mixins]
      .sort()
      .map(mixin => `@include ${namespace}.${mixin}(/* TODO(v17): pass $your-theme here */);`),
    '',
  ].map(line => (indentation + line).trimRight());
}

/**
 * Checks which theme bases are found in the file via the existing included mixins,
 * and which ones may be missing.
 */
export function checkThemeBaseMixins(fileContent: string): {
  found: Set<string>;
  missing: Set<string>;
} {
  const found = new Set<string>();
  const missing = new Set<string>();

  // Strip out comments, so they don't confuse our migration.
  const {content} = escapeComments(fileContent);
  const materialNamespaces = getAtUseNamespaces(content, '@angular/material');

  // Check over all namespaces for mixins of interest.
  for (const namespace of materialNamespaces) {
    for (const mixins of THEME_MIXIN_SETS) {
      // If they include the theme mixin, that accounts for the base theme styles.
      if (isMixinAtIncluded(content, namespace, mixins.theme)) {
        found.add(mixins.base);
        missing.delete(mixins.base);
        continue;
      }
      // If they haven't called the theme mixin, but do call one of the partials,
      // we assume they're missing the base styles.
      if (!found.has(mixins.base)) {
        if (
          isMixinAtIncluded(content, namespace, mixins.color) ||
          isMixinAtIncluded(content, namespace, mixins.typography) ||
          isMixinAtIncluded(content, namespace, mixins.density)
        ) {
          missing.add(mixins.base);
        }
      }
    }
  }

  return {found, missing};
}

/** Adds the given theme base mixins, after the call to `mat.core()`. */
export function addThemeBaseMixins(fileContent: string, mixins: Set<string>): string {
  // Strip out comments, so they don't confuse our migration.
  let {content, placeholders} = escapeComments(fileContent);
  const materialNamespaces = getAtUseNamespaces(content, '@angular/material');

  for (const namespace of materialNamespaces) {
    // Update the @includes in reverse order, so our changes don't mess up the indices we found.
    const coreIncludes = getAtIncludes(content, namespace, 'core').reverse();
    for (const coreInclude of coreIncludes) {
      if (coreInclude.index === undefined) {
        throw Error(`Cannot find location of mat.core() match: ${coreInclude}`);
      }
      const indentation = getIndentation(content, coreInclude.index);
      const lines = getMissingMixinLines(namespace, mixins, indentation);
      content = insertLinesAfterMatch(content, coreInclude, lines);
    }
  }

  return restoreComments(content, placeholders);
}
