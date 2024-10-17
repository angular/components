/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {A11yModule, CdkTrapFocus} from '@angular/cdk/a11y';
import {_supportsShadowDom} from '@angular/cdk/platform';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'shadow-dom-demo',
  template: '<ng-content></ng-content>',
  host: {'class': 'demo-focus-trap-shadow-root'},
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusTrapShadowDomDemo {}

@Component({
  selector: 'focus-trap-demo',
  templateUrl: 'focus-trap-demo.html',
  styleUrl: 'focus-trap-demo.css',
  imports: [A11yModule, MatButtonModule, MatCardModule, MatToolbarModule, FocusTrapShadowDomDemo],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusTrapDemo implements AfterViewInit {
  dialog = inject(MatDialog);

  @ViewChild('newElements')
  private _newElements: ElementRef<HTMLElement>;

  @ViewChildren(CdkTrapFocus)
  private _focusTraps: QueryList<CdkTrapFocus>;

  _supportsShadowDom = _supportsShadowDom();

  readonly cdr = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    // We want all the traps to be disabled by default, but doing so while using the value in
    // the view will result in "changed after checked" errors so we defer it to the next tick.
    setTimeout(() => {
      this._focusTraps.forEach(trap => (trap.enabled = false));
      this.cdr.markForCheck();
    });
  }

  toggleFocus(instance: CdkTrapFocus) {
    instance.enabled = !instance.enabled;
    if (instance.enabled) {
      instance.focusTrap.focusInitialElementWhenReady();
    }
  }

  addNewElement() {
    const textarea = document.createElement('textarea');
    textarea.setAttribute('placeholder', 'I am a new element!');
    this._newElements.nativeElement.appendChild(textarea);
  }

  openDialog() {
    this.dialog.open(FocusTrapDialogDemo);
  }
}

let dialogCount = 0;

@Component({
  selector: 'focus-trap-dialog-demo',
  styleUrl: 'focus-trap-dialog-demo.css',
  templateUrl: 'focus-trap-dialog-demo.html',
  imports: [MatDialogTitle, MatDialogContent, MatDialogClose, MatDialogActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusTrapDialogDemo {
  dialog = inject(MatDialog);

  id = dialogCount++;

  openAnotherDialog() {
    this.dialog.open(FocusTrapDialogDemo);
  }
}
