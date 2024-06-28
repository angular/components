/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Map of override mixins that had some of their tokens renamed. */
const RENAMED_TOKEN_OVERRIDES: {[key: string]: {[token: string]: string[]}} = {
  'core-overrides': {
    'background-color': ['app-background-color'],
    'text-color': ['app-text-color'],
    'elevation-shadow-level-0': ['app-elevation-shadow-level-0'],
    'elevation-shadow-level-1': ['app-elevation-shadow-level-1'],
    'elevation-shadow-level-2': ['app-elevation-shadow-level-2'],
    'elevation-shadow-level-3': ['app-elevation-shadow-level-3'],
    'elevation-shadow-level-4': ['app-elevation-shadow-level-4'],
    'elevation-shadow-level-5': ['app-elevation-shadow-level-5'],
    'elevation-shadow-level-6': ['app-elevation-shadow-level-6'],
    'elevation-shadow-level-7': ['app-elevation-shadow-level-7'],
    'elevation-shadow-level-8': ['app-elevation-shadow-level-8'],
    'elevation-shadow-level-9': ['app-elevation-shadow-level-9'],
    'elevation-shadow-level-10': ['app-elevation-shadow-level-10'],
    'elevation-shadow-level-11': ['app-elevation-shadow-level-11'],
    'elevation-shadow-level-12': ['app-elevation-shadow-level-12'],
    'elevation-shadow-level-13': ['app-elevation-shadow-level-13'],
    'elevation-shadow-level-14': ['app-elevation-shadow-level-14'],
    'elevation-shadow-level-15': ['app-elevation-shadow-level-15'],
    'elevation-shadow-level-16': ['app-elevation-shadow-level-16'],
    'elevation-shadow-level-17': ['app-elevation-shadow-level-17'],
    'elevation-shadow-level-18': ['app-elevation-shadow-level-18'],
    'elevation-shadow-level-19': ['app-elevation-shadow-level-19'],
    'elevation-shadow-level-20': ['app-elevation-shadow-level-20'],
    'elevation-shadow-level-21': ['app-elevation-shadow-level-21'],
    'elevation-shadow-level-22': ['app-elevation-shadow-level-22'],
    'elevation-shadow-level-23': ['app-elevation-shadow-level-23'],
    'elevation-shadow-level-24': ['app-elevation-shadow-level-24'],
    'color': ['ripple-color'],
    'selected-state-label-text-color': ['option-selected-state-label-text-color'],
    'label-text-color': ['option-label-text-color', 'optgroup-label-text-color'],
    'hover-state-layer-color': ['option-hover-state-layer-color'],
    'focus-state-layer-color': ['option-focus-state-layer-color'],
    'selected-state-layer-color': ['option-selected-state-layer-color'],
    'label-text-font': ['option-label-text-font', 'optgroup-label-text-font'],
    'label-text-line-height': ['option-label-text-line-height', 'optgroup-label-text-line-height'],
    'label-text-size': ['option-label-text-size', 'optgroup-label-text-size'],
    'label-text-tracking': ['option-label-text-tracking', 'optgroup-label-text-tracking'],
    'label-text-weight': ['option-label-text-weight', 'optgroup-label-text-weight'],
    'selected-icon-color': ['pseudo-checkbox-full-selected-icon-color'],
    'selected-checkmark-color': [
      'pseudo-checkbox-full-selected-checkmark-color',
      'pseudo-checkbox-minimal-selected-checkmark-color',
    ],
    'unselected-icon-color': ['pseudo-checkbox-full-unselected-icon-color'],
    'disabled-selected-checkmark-color': [
      'pseudo-checkbox-full-disabled-selected-checkmark-color',
      'pseudo-checkbox-minimal-disabled-selected-checkmark-color',
    ],
    'disabled-unselected-icon-color': ['pseudo-checkbox-full-disabled-unselected-icon-color'],
    'disabled-selected-icon-color': ['pseudo-checkbox-full-disabled-selected-icon-color'],
  },
  'pseudo-checkbox-overrides': {
    'selected-icon-color': ['full-selected-icon-color'],
    'selected-checkmark-color': [
      'full-selected-checkmark-color',
      'minimal-selected-checkmark-color',
    ],
    'unselected-icon-color': ['full-unselected-icon-color'],
    'disabled-selected-checkmark-color': [
      'full-disabled-selected-checkmark-color',
      'minimal-disabled-selected-checkmark-color',
    ],
    'disabled-unselected-icon-color': ['full-disabled-unselected-icon-color'],
    'disabled-selected-icon-color': ['full-disabled-selected-icon-color'],
  },
  'button-overrides': {
    'container-shape': [
      'filled-container-shape',
      'outlined-container-shape',
      'protected-container-shape',
      'text-container-shape',
    ],
    'keep-touch-target': [
      'filled-keep-touch-target',
      'outlined-keep-touch-target',
      'protected-keep-touch-target',
      'text-keep-touch-target',
    ],
    'container-color': ['filled-container-color', 'protected-container-color'],
    'label-text-color': [
      'filled-label-text-color',
      'outlined-label-text-color',
      'protected-label-text-color',
      'text-label-text-color',
    ],
    'disabled-container-color': [
      'filled-disabled-container-color',
      'protected-disabled-container-color',
    ],
    'disabled-label-text-color': [
      'filled-disabled-label-text-color',
      'outlined-disabled-label-text-color',
      'protected-disabled-label-text-color',
      'text-disabled-label-text-color',
    ],
    'label-text-font': [
      'filled-label-text-font',
      'outlined-label-text-font',
      'protected-label-text-font',
      'text-label-text-font',
    ],
    'label-text-size': [
      'filled-label-text-size',
      'outlined-label-text-size',
      'protected-label-text-size',
      'text-label-text-size',
    ],
    'label-text-tracking': [
      'filled-label-text-tracking',
      'outlined-label-text-tracking',
      'protected-label-text-tracking',
      'text-label-text-tracking',
    ],
    'label-text-weight': [
      'filled-label-text-weight',
      'outlined-label-text-weight',
      'protected-label-text-weight',
      'text-label-text-weight',
    ],
    'label-text-transform': [
      'filled-label-text-transform',
      'outlined-label-text-transform',
      'protected-label-text-transform',
      'text-label-text-transform',
    ],
    'container-height': [
      'filled-container-height',
      'outlined-container-height',
      'protected-container-height',
      'text-container-height',
    ],
    'horizontal-padding': [
      'filled-horizontal-padding',
      'outlined-horizontal-padding',
      'protected-horizontal-padding',
      'text-horizontal-padding',
    ],
    'icon-spacing': [
      'filled-icon-spacing',
      'outlined-icon-spacing',
      'protected-icon-spacing',
      'text-icon-spacing',
    ],
    'icon-offset': [
      'filled-icon-offset',
      'outlined-icon-offset',
      'protected-icon-offset',
      'text-icon-offset',
    ],
    'state-layer-color': [
      'filled-state-layer-color',
      'outlined-state-layer-color',
      'protected-state-layer-color',
      'text-state-layer-color',
    ],
    'disabled-state-layer-color': [
      'filled-disabled-state-layer-color',
      'outlined-disabled-state-layer-color',
      'protected-disabled-state-layer-color',
      'text-disabled-state-layer-color',
    ],
    'ripple-color': [
      'filled-ripple-color',
      'outlined-ripple-color',
      'protected-ripple-color',
      'text-ripple-color',
    ],
    'hover-state-layer-opacity': [
      'filled-hover-state-layer-opacity',
      'outlined-hover-state-layer-opacity',
      'protected-hover-state-layer-opacity',
      'text-hover-state-layer-opacity',
    ],
    'focus-state-layer-opacity': [
      'filled-focus-state-layer-opacity',
      'outlined-focus-state-layer-opacity',
      'protected-focus-state-layer-opacity',
      'text-focus-state-layer-opacity',
    ],
    'pressed-state-layer-opacity': [
      'filled-pressed-state-layer-opacity',
      'outlined-pressed-state-layer-opacity',
      'protected-pressed-state-layer-opacity',
      'text-pressed-state-layer-opacity',
    ],
    'touch-target-display': [
      'filled-touch-target-display',
      'outlined-touch-target-display',
      'protected-touch-target-display',
      'text-touch-target-display',
    ],
    'outline-width': ['outlined-outline-width'],
    'disabled-outline-color': ['outlined-disabled-outline-color'],
    'outline-color': ['outlined-outline-color'],
    'container-elevation': ['protected-container-elevation'],
    'disabled-container-elevation': ['protected-disabled-container-elevation'],
    'focus-container-elevation': ['protected-focus-container-elevation'],
    'hover-container-elevation': ['protected-hover-container-elevation'],
    'pressed-container-elevation': ['protected-pressed-container-elevation'],
    'container-shadow-color': ['protected-container-shadow-color'],
    'with-icon-horizontal-padding': ['text-with-icon-horizontal-padding'],
  },
  'fab-overrides': {
    'container-shape': ['container-shape', 'small-container-shape', 'extended-container-shape'],
    'icon-size': ['icon-size', 'small-icon-size'],
    'container-color': ['container-color', 'small-container-color'],
    'container-elevation': [
      'container-elevation',
      'small-container-elevation',
      'extended-container-elevation',
    ],
    'focus-container-elevation': [
      'focus-container-elevation',
      'small-focus-container-elevation',
      'extended-focus-container-elevation',
    ],
    'hover-container-elevation': [
      'hover-container-elevation',
      'small-hover-container-elevation',
      'extended-hover-container-elevation',
    ],
    'pressed-container-elevation': [
      'pressed-container-elevation',
      'small-pressed-container-elevation',
      'extended-pressed-container-elevation',
    ],
    'container-shadow-color': [
      'container-shadow-color',
      'small-container-shadow-color',
      'extended-container-shadow-color',
    ],
    'container-height': ['extended-container-height'],
    'label-text-font': ['extended-label-text-font'],
    'label-text-size': ['extended-label-text-size'],
    'label-text-tracking': ['extended-label-text-tracking'],
    'label-text-weight': ['extended-label-text-weight'],
    'foreground-color': ['foreground-color', 'small-foreground-color'],
    'state-layer-color': ['state-layer-color', 'small-state-layer-color'],
    'disabled-state-layer-color': [
      'disabled-state-layer-color',
      'small-disabled-state-layer-color',
    ],
    'ripple-color': ['ripple-color', 'small-ripple-color'],
    'hover-state-layer-opacity': ['hover-state-layer-opacity', 'small-hover-state-layer-opacity'],
    'focus-state-layer-opacity': ['focus-state-layer-opacity', 'small-focus-state-layer-opacity'],
    'pressed-state-layer-opacity': [
      'pressed-state-layer-opacity',
      'small-pressed-state-layer-opacity',
    ],
    'disabled-state-container-color': [
      'disabled-state-container-color',
      'small-disabled-state-container-color',
    ],
    'disabled-state-foreground-color': [
      'disabled-state-foreground-color',
      'small-disabled-state-foreground-color',
    ],
    'touch-target-display': ['touch-target-display', 'small-touch-target-display'],
  },
  'card-overrides': {
    'container-shape': ['elevated-container-shape', 'outlined-container-shape'],
    'container-color': ['elevated-container-color', 'outlined-container-color'],
    'container-elevation': ['elevated-container-elevation', 'outlined-container-elevation'],
    'outline-width': ['outlined-outline-width'],
    'outline-color': ['outlined-outline-color'],
    'undefined': [''],
  },
};

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
export function migrateTokenOverridesUsages(fileContent: string): string {
  // Strip out comments, so they don't confuse our migration.
  let {content, placeholders} = escapeComments(fileContent);
  const materialNamespaces = getNamespaces('@angular/material', content);

  // TODO: Migrate overide mixins that had their tokens renamed.
  for (const namespace of materialNamespaces) {
    for (const overrideMixin of Object.keys(RENAMED_TOKEN_OVERRIDES)) {
      content = migrateOverrideMixin(
        content,
        namespace,
        overrideMixin,
        RENAMED_TOKEN_OVERRIDES[overrideMixin],
      );
    }
  }

  return restoreComments(content, placeholders);
}

/**
 * Update token names in calls to the given mixin.
 */
function migrateOverrideMixin(
  content: string,
  namespace: string,
  mixin: string,
  tokens: {[token: string]: string[]},
): string {
  const usagePrefix = new RegExp(String.raw`\s${namespace}\.${mixin}\(`, 'g');
  const usages = findAllIndicies(content, usagePrefix).sort((a, b) => b - a);
  for (const usageStart of usages) {
    const usageEnd =
      findMatchingClose(content, usageStart + mixin.length + namespace.length + 2) + 1;
    let usageText = content.slice(usageStart, usageEnd);
    for (const [token, replacements] of Object.entries(tokens)) {
      usageText = migrateTokenNameInOverride(usageText, token, replacements);
    }
    content = content.slice(0, usageStart) + usageText + content.slice(usageEnd);
  }
  return content;
}

/**
 * Update the name of a token in a call to an override mixin.
 */
function migrateTokenNameInOverride(
  content: string,
  token: string,
  replacements: string[],
): string {
  const match = new RegExp(String.raw`[,(]\s*${token}:`).exec(content);
  if (match === null) {
    return content;
  }
  const start = match.index + 1;
  let end = content.indexOf(',', start + 1);
  if (end === -1) {
    end = content.length - 2;
  }
  const tokenProp = content.slice(start, end);
  const hasLeadingWhitespace = /\s/.test(content[start]);
  const hasTrailingComma = content[end - 1] === ',';
  return (
    content.slice(0, start) +
    replacements
      .map((replacement, i) => {
        let result = tokenProp.replace(token, replacement);
        if (!hasLeadingWhitespace && i > 0) {
          result = ' ' + result;
        }
        if (!hasTrailingComma && i < replacements.length - 1) {
          result = result.trimEnd() + ',';
        }
        return result;
      })
      .join('') +
    content.slice(end)
  );
}

/**
 * Find the index of the matching close paren for the open paren at the given index.
 */
function findMatchingClose(content: string, start: number) {
  let index = start;
  if (content[index] !== '(') {
    throw Error('Expected open parenthesis.');
  }

  let count = 1;
  while (count > 0 && index < content.length) {
    index++;
    if (content[index] === '(') {
      count++;
    } else if (content[index] === ')') {
      count--;
    }
  }

  if (count !== 0) {
    throw Error('Could not find matching close parenthesis.');
  }

  return index;
}

/**
 * Find all indicies of the given pattern in the content.
 */
function findAllIndicies(content: string, pattern: RegExp) {
  const indicies = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(content)) !== null) {
    indicies.push(m.index);
  }
  return indicies;
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
