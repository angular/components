/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RippleOverviewExample} from '@angular/components-examples/material/core';
import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRipple} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'ripple-demo',
  templateUrl: 'ripple-demo.html',
  styleUrl: 'ripple-demo.css',
  imports: [
    RippleOverviewExample,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RippleDemo {
  @ViewChild(MatRipple) ripple: MatRipple;

  centered = false;
  disabled = false;
  unbounded = false;
  rounded = false;
  radius: number;
  rippleSpeed = 1;
  rippleColor = '';

  disableButtonRipples = false;

  launchRipple(persistent = false, disableAnimation = false) {
    if (!this.ripple) {
      return;
    }

    const rippleConfig = {
      centered: true,
      persistent: persistent,
      animation: disableAnimation ? {enterDuration: 0, exitDuration: 0} : undefined,
    };

    this.ripple.launch(0, 0, rippleConfig);
  }

  fadeOutAll() {
    if (this.ripple) {
      this.ripple.fadeOutAll();
    }
  }
}
