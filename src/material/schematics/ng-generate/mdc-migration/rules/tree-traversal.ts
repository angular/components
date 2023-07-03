/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ParsedTemplate,
  TmplAstElement,
  TmplAstNode,
  TmplAstTemplate,
  parseTemplate as parseTemplateUsingCompiler,
} from '@angular/compiler';

/**
 * Traverses the given tree of nodes and runs the given callbacks for each Element node encountered.
 *
 * Note that updates to the start tags of html element should be done in the postorder callback,
 * and updates to the end tags of html elements should be done in the preorder callback to avoid
 * issues with line collisions.
 *
 * @param nodes The nodes of the ast from a parsed template.
 * @param preorderCallback A function that gets run for each Element node in a preorder traversal.
 * @param postorderCallback A function that gets run for each Element node in a postorder traversal.
 */
export function visitElements(
  nodes: TmplAstNode[],
  preorderCallback: (node: TmplAstElement) => void = () => {},
  postorderCallback: (node: TmplAstElement) => void = () => {},
): void {
  for (let i = nodes.length - 1; i > -1; i--) {
    const node = nodes[i];
    const isElement = node instanceof TmplAstElement;

    if (isElement) {
      preorderCallback(node);
    }

    // Descend both into elements and templates in order to cover cases like `*ngIf` and `*ngFor`.
    if (isElement || node instanceof TmplAstTemplate) {
      visitElements(node.children, preorderCallback, postorderCallback);
    }

    if (isElement) {
      postorderCallback(node);
    }
  }
}

/**
 * A wrapper for the Angular compilers parseTemplate, which passes the correct options to ensure
 * the parsed template is accurate.
 *
 * For more details, see https://github.com/angular/angular/blob/4332897baa2226ef246ee054fdd5254e3c129109/packages/compiler-cli/src/ngtsc/annotations/component/src/resources.ts#L230.
 *
 * @param template text of the template to parse
 * @param templateUrl URL to use for source mapping of the parsed template
 * @returns the updated template html.
 */
export function parseTemplate(template: string, templateUrl: string = ''): ParsedTemplate {
  return parseTemplateUsingCompiler(template, templateUrl, {
    preserveWhitespaces: true,
    preserveLineEndings: true,
    leadingTriviaChars: [],
  });
}

/**
 * Replaces the start tag of the given Element node inside the html document with a new tag name.
 *
 * @param html The full html document.
 * @param node The Element node to be updated.
 * @param tag A new tag name.
 * @returns an updated html document.
 */
export function replaceStartTag(html: string, node: TmplAstElement, tag: string): string {
  return replaceAt(html, node.startSourceSpan.start.offset + 1, node.name, tag);
}

/**
 * Replaces the end tag of the given Element node inside the html document with a new tag name.
 *
 * @param html The full html document.
 * @param node The Element node to be updated.
 * @param tag A new tag name.
 * @returns an updated html document.
 */
export function replaceEndTag(html: string, node: TmplAstElement, tag: string): string {
  if (!node.endSourceSpan) {
    return html;
  }
  return replaceAt(html, node.endSourceSpan.start.offset + 2, node.name, tag);
}

/**
 * Appends an attribute to the given node of the template html.
 *
 * @param html The template html to be updated.
 * @param node The node to be updated.
 * @param name The name of the attribute.
 * @param update The function that determines how to update the value.
 * @returns The updated template html.
 */
export function updateAttribute(
  html: string,
  node: TmplAstElement,
  name: string,
  update: (old: string | null) => string | null,
): string {
  const existingAttr = node.attributes.find(currentAttr => currentAttr.name === name);

  // If the attribute has a value already, replace it.
  if (existingAttr && existingAttr.keySpan) {
    const updatedValue = update(existingAttr.valueSpan?.toString() || '');
    if (updatedValue == null) {
      // Delete attribute
      return (
        html.slice(0, existingAttr.sourceSpan.start.offset).trimEnd() +
        html.slice(existingAttr.sourceSpan.end.offset)
      );
    } else if (updatedValue == '') {
      // Delete value from attribute
      return (
        html.slice(0, existingAttr.keySpan.end.offset) +
        html.slice(existingAttr.sourceSpan.end.offset)
      );
    } else {
      // Set attribute value
      if (existingAttr.valueSpan) {
        // Replace attribute value
        return (
          html.slice(0, existingAttr.valueSpan.start.offset) +
          updatedValue +
          html.slice(existingAttr.valueSpan.end.offset)
        );
      } else {
        // Add value to attribute
        return (
          html.slice(0, existingAttr.keySpan.end.offset) +
          `="${updatedValue}"` +
          html.slice(existingAttr.keySpan.end.offset)
        );
      }
    }
  }

  const newValue = update(null);

  // No change needed if attribute should be deleted and is already not present.
  if (newValue == null) {
    return html;
  }

  // Otherwise insert a new attribute.
  const index = node.startSourceSpan.start.offset + node.name.length + 1;
  const prefix = html.slice(0, index);
  const suffix = html.slice(index);
  const attrText = newValue ? `${name}="${newValue}"` : `${name}`;
  const indentation = parseIndentation(html, node);
  return prefix + indentation + attrText + suffix;
}

function parseIndentation(html: string, node: TmplAstElement): string {
  let whitespace = '';
  let startOffset = node.startSourceSpan.start.offset + node.name.length + 1;

  // Starting after the start source span's tagname,
  // read and store each char until we reach a non-whitespace char.

  for (let i = startOffset; i < node.startSourceSpan.end.offset - 1; i++) {
    if (!/\s/.test(html.charAt(i))) {
      break;
    }
    whitespace += html.charAt(i);
  }
  return whitespace || ' ';
}

/**
 * Replaces a substring of a given string starting at some offset index.
 *
 * @param str A string to be updated.
 * @param offset An offset index to start at.
 * @param oldSubstr The old substring to be replaced.
 * @param newSubstr A new substring.
 * @returns the updated string.
 */
function replaceAt(str: string, offset: number, oldSubstr: string, newSubstr: string): string {
  const index = offset;
  const prefix = str.slice(0, index);
  const suffix = str.slice(index + oldSubstr.length);
  return prefix + newSubstr + suffix;
}
