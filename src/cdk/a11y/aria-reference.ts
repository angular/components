/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** IDs are deliminated by an empty space, as per the spec. */
const ID_DELIMINATOR = ' ';

/**
 * Adds the given ID to the specified ARIA attribute on an element.
 * Used for attributes such as aria-labelledby, aria-owns, etc.
 */
export function addAriaReferencedId(el: Element, attr: string, id: string) {
  const ids = getAriaReferenceIds(el, attr);
  if (ids.some(existingId => existingId.trim() == id.trim())) { return; }
  ids.push(id.trim());

  el.setAttribute(attr, ids.join(ID_DELIMINATOR));
}

/**
 * Removes the given ID from the specified ARIA attribute on an element.
 * Used for attributes such as aria-labelledby, aria-owns, etc.
 */
export function removeAriaReferencedId(el: Element, attr: string, id: string) {
  const ids = getAriaReferenceIds(el, attr);
  const filteredIds = ids.filter(val => val != id.trim());

  el.setAttribute(attr, filteredIds.join(ID_DELIMINATOR));
}

/**
 * Gets the list of IDs referenced by the given ARIA attribute on an element.
 * Used for attributes such as aria-labelledby, aria-owns, etc.
 */
export function getAriaReferenceIds(el: Element, attr: string): string[] {
  const idsValue = (el.getAttribute(attr) || '').trim();

  // Get string array of all individual ids (whitespace deliminated) in the attribute value
  const idsArray = idsValue.match(/\S+/g) || [];

  return idsArray.map(id => id.trim());
}
