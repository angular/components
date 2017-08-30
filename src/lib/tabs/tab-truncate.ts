/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mdTruncate' })
export class MdTabLabelTruncate implements PipeTransform {
  transform(value: string, limit: number = 70, trail: String = '…'): string {
    if (value.length > limit) {
      const split = value.split(' ');
      if (split.length === 1) {
        return value.substring(0, limit) + trail;
      } else {
        let words = '';
        let i = 0;

        while ((i < split.length) && ((words.length + split[i].length) < limit)) {
          words += split[i++] + ' ';
        }

        return words.trim() + trail;
      }
    }

    return value;
  }
}
