/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {ELEMENT_DATA} from '../element-data';
import {CdkScrollable} from '@angular/cdk/scrolling';

@Component({
  moduleId: module.id,
  templateUrl: 'footer-table.html',
  styleUrls: ['footer-table.css'],
})
export class FooterTableDemo {
  columnsToDisplay = ['name', 'weight', 'symbol', 'position'];
  data = ELEMENT_DATA.slice();

  isScrollPositionTop = true;
  isScrollPositionBottom = false;

  @ViewChild(CdkScrollable) scrollable: CdkScrollable;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.scrollable.elementScrolled().subscribe(() => this.updateStickyStyles());
  }

  updateStickyStyles() {
    const tableEl = this.scrollable.getElementRef().nativeElement;
    let changed = false;

    const isScrollPositionTop = !tableEl.scrollTop;
    if (this.isScrollPositionTop != isScrollPositionTop) {
      this.isScrollPositionTop = isScrollPositionTop;
      changed = true;
    }

    const height = tableEl.getBoundingClientRect().height;
    const isScrollPositionBottom = !(tableEl.scrollHeight - tableEl.scrollTop - height);

    if (this.isScrollPositionBottom != isScrollPositionBottom) {
      this.isScrollPositionBottom = isScrollPositionBottom;
      changed = true;
    }

    if (changed) {
      this.changeDetectorRef.detectChanges();
    }
  }
}
