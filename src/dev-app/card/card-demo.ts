/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardAppearance, MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'card-demo',
  templateUrl: 'card-demo.html',
  styleUrl: 'card-demo.css',
  encapsulation: ViewEncapsulation.None,
  imports: [MatCardModule, MatButtonModule, MatCheckboxModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDemo {
  appearance: MatCardAppearance = 'raised';
  longText = `Once upon a midnight dreary, while I pondered, weak and weary,
              Over many a quaint and curious volume of forgotten lore—
              While I nodded, nearly napping, suddenly there came a tapping,
              As of some one gently rapping, rapping at my chamber door.
              “’Tis some visitor,” I muttered, “tapping at my chamber door—
              Only this and nothing more.”`;
  toggleAppearance() {
    this.appearance = this.appearance == 'raised' ? 'outlined' : 'raised';
  }
}
