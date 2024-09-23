/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Template string function that can be used to dedent a given string
 * literal. The smallest common indentation will be omitted.
 */
export function dedent(strings: TemplateStringsArray, ...values: any[]) {
  let joinedString = '';
  for (let i = 0; i < values.length; i++) {
    joinedString += `${strings[i]}${values[i]}`;
  }
  joinedString += strings[strings.length - 1];

  const matches = joinedString.match(/^[ \t]*(?=\S)/gm);
  if (matches === null) {
    return joinedString;
  }

  const minLineIndent = Math.min(...matches.map(el => el.length));
  const omitMinIndentRegex = new RegExp(`^[ \\t]{${minLineIndent}}`, 'gm');
  return minLineIndent > 0 ? joinedString.replace(omitMinIndentRegex, '') : joinedString;
}
