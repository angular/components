/* tslint:disable */

import { tags } from '@angular-devkit/core';
import { SchematicsException } from '@angular-devkit/schematics';

export function validateName(name: string): void {
  if (name && /^\d/.test(name)) {
    throw new SchematicsException(tags.oneLine`name (${name})
        can not start with a digit.`);
  }
}
