/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Clipboard, ClipboardModule} from '@angular/cdk/clipboard';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'clipboard-demo',
  styleUrl: 'clipboard-demo.css',
  templateUrl: 'clipboard-demo.html',
  imports: [ClipboardModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipboardDemo {
  private _clipboard = inject(Clipboard);

  attempts = 3;

  value =
    `Did you ever hear the tragedy of Darth Plagueis The Wise? I thought not. It's not ` +
    `a story the Jedi would tell you. It's a Sith legend. Darth Plagueis was a Dark Lord ` +
    `of the Sith, so powerful and so wise he could use the Force to influence the ` +
    `midichlorians to create life… He had such a knowledge of the dark side that he could ` +
    `even keep the ones he cared about from dying. The dark side of the Force is a pathway ` +
    `to many abilities some consider to be unnatural. He became so powerful… the only ` +
    `thing he was afraid of was losing his power, which eventually, of course, he did. ` +
    `Unfortunately, he taught his apprentice everything he knew, then his apprentice ` +
    `killed him in his sleep. Ironic. He could save others from death, but not himself.`;

  copyViaService() {
    this._clipboard.copy(this.value);
  }
}
