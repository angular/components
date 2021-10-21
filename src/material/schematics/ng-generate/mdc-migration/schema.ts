/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Schema as ComponentSchema} from '@schematics/angular/component/schema';

export interface Schema extends ComponentSchema {
  // TODO(mmalerba): Are these supposed to be fulled in automatically?
  // Seems to be for the other schematics, but mine won't compile without these.
  path: string;
  components: string[];
}
