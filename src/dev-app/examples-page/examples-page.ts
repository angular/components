/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EXAMPLE_COMPONENTS} from '@angular/components-examples';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ExampleList} from '../example/example-list';

/** Renders all material examples listed in the generated EXAMPLE_COMPONENTS. */
@Component({
  template: `<material-example-list [ids]="examples"></material-example-list>`,
  imports: [ExampleList],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamplesPage {
  examples = Object.keys(EXAMPLE_COMPONENTS);
}
