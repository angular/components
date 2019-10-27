/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Coerces a value to an array of strings. */
export function coerceStringArray(value: any, separator: string | RegExp = ','): string[] {
    if (value == null) {
        return [];
    }
    const stringArray = Array.isArray(value) ?
        value.map(item => `${item}`) :
        value.toString().split(separator);
    return stringArray
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
}

