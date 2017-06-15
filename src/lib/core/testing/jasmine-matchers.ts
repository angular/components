/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Collection of useful custom jasmine matchers for tests.
 */
export const customMatchers: jasmine.CustomMatcherFactories = {
  /** Matcher verifying that the element has the expected role attribute. */
  toBeRole: () => {
    return {
      compare: function (element: Element, expectedRole: string) {
        return checkElementAttribute(element, 'role', expectedRole);
      }
    };
  },

  /** Matcher verifying that the element has the expected aria label. */
  toHaveAriaLabel: () => {
    return {
      compare: function (element: Element, expectedAriaLabel: string) {
        return checkElementAttribute(element, 'aria-label', expectedAriaLabel);
      }
    };
  },
};

function checkElementAttribute(element, attr, expectation): jasmine.CustomMatcherResult {
  const result: jasmine.CustomMatcherResult = {pass: false};
  const actual = element.getAttribute(attr);

  result.pass = actual === expectation;
  result.message = `Expected aria-label for ${element.tagName} to be ${expectation}`;

  if (!result.pass) {
    result.message += ` but was ${actual}`;
  }

  return result;
}
