/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Records the performance of the given function.
 *
 * @param id A unique identifier.
 * @param callback A function whose performance will be recorded.
 */
export async function benchmark(id: string, callback: Function) {
  const t0 = performance.now();
  await callback();
  const t1 = performance.now();
  console.warn(`${id}: ${t1 - t0}`);
}

export function getButtonWithText(text: string): HTMLButtonElement {
  const xpathExpression = `//button[//span[text()=' ${text} ']]`;
  const xPathResult = document.evaluate(
    xpathExpression,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  return xPathResult.singleNodeValue as HTMLButtonElement;
}
