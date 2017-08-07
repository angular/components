/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** IDs are deliminated by an empty space, as per the spec. */
const ID_DELIMINATOR = ' ';

/** Adds an aria reference ID to an element's aria property if it is not already present. */
export function addAriaReferencedId(el: HTMLElement, id: string, attr: string) {
  const ids = getAriaReferenceIds(el, attr);
  if (ids.some(existingId => existingId.trim() == id.trim())) { return; }
  ids.push(id.trim());

  el.setAttribute(attr, ids.join(ID_DELIMINATOR));
}

/** Removes an aria reference ID from an element's aria property. */
export function removeAriaReferencedId(el: HTMLElement, id: string, attr: string) {
  const ids = getAriaReferenceIds(el, attr);
  const filteredIds = ids.filter(val => val != id.trim());

  el.setAttribute(attr, filteredIds.join(ID_DELIMINATOR));
}

/** Returns a list of an element's aria reference IDs for the provided aria attribute. */
export function getAriaReferenceIds(el: HTMLElement, attr: string): string[] {
  const ids = (el.getAttribute(attr) || '').trim();
  return ids ? ids.split(ID_DELIMINATOR).map(id => id.trim()) : [];
}
