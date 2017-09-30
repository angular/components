/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

 /* Parses arguments into a ngClass-like object */
export function parseClassList(classList:
      undefined|string|string[]|Set<string>|{[klass: string]: any}) {
  let klasses = {};

  if (classList) {
    if (Array.isArray(classList) || classList instanceof Set) {
      (<any>classList).forEach((klass: string) => klasses[klass] = true);
    } else if (typeof classList === 'string') {
      klasses = (<string>classList).split(' ').reduce((obj: any, className: string) => {
        obj[className] = true;
        return obj;
      }, {});
    }
  }

  return klasses;
}

/** Parses a ngClass-like object into an array of strings */
export function getClassList(classList: {[klass: string]: any}): string[] {
  return Object.keys(classList).reduce((arr: string[], className: string) => {
    if (classList[className]) {
      arr.push(className);
    }
    return arr;
  }, []);
}

/** Parses a ngClass-like object into an array of strings */
export function parseAndGetClassList(
      klasses: undefined|string|string[]|Set<string>|{[klass: string]: any}) {
  return getClassList(parseClassList(klasses));
}
