/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SchematicsException} from '@angular-devkit/schematics';
import {DefaultTreeAdapterMap} from 'parse5';

// At the time of writing `parse5` doesn't expose the node interfaces directly, even though
// they're used as return types, but We can still access them through `DefaultTreeAdapterMap`.
export type Element = DefaultTreeAdapterMap['element'];
export type ChildNode = DefaultTreeAdapterMap['childNode'];

/** Determines the indentation of child elements for the given Parse5 element. */
export function getChildElementIndentation(element: Element) {
  const childElement = element.childNodes.find(node => (node as Element).tagName) as Element | null;

  if ((childElement && !childElement.sourceCodeLocation) || !element.sourceCodeLocation) {
    throw new SchematicsException(
      'Cannot determine child element indentation because the ' +
        'specified Parse5 element does not have any source code location metadata.',
    );
  }

  const startColumns = childElement
    ? // In case there are child elements inside of the element, we assume that their
      // indentation is also applicable for other child elements.
      childElement.sourceCodeLocation!.startCol
    : // In case there is no child element, we just assume that child elements should be indented
      // by two spaces.
      element.sourceCodeLocation!.startCol + 2;

  // Since Parse5 does not set the `startCol` properties as zero-based, we need to subtract
  // one column in order to have a proper zero-based offset for the indentation.
  return startColumns - 1;
}
