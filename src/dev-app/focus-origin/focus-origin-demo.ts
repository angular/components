/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';


@Component({
  selector: 'focus-origin-demo',
  templateUrl: 'focus-origin-demo.html',
  styleUrls: ['focus-origin-demo.css'],
})
export class FocusOriginDemo implements OnInit, OnDestroy  {
  containerEvents: FocusOrigin[] = [];

  @ViewChild('c', {static: true}) container: ElementRef<HTMLElement>;

  constructor(public fom: FocusMonitor) {
  }

  ngOnInit(): void {
    this.fom.monitor(this.container, true)
      .subscribe((value: FocusOrigin) => {
        this.containerEvents.push(value);
      });
  }

  ngOnDestroy(): void {
    this.fom.stopMonitoring(this.container);
  }
}
