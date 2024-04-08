/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DIALOG_DATA, Dialog, DialogConfig, DialogModule, DialogRef} from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {FormsModule} from '@angular/forms';

const defaultDialogConfig = new DialogConfig();

@Component({
  selector: 'dialog-demo',
  templateUrl: 'dialog-demo.html',
  styleUrl: 'dialog-demo.css',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [DialogModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogDemo {
  dialogRef: DialogRef<string> | null;
  result: string;
  actionsAlignment: 'start' | 'center' | 'end';
  config = {
    disableClose: defaultDialogConfig.disableClose,
    panelClass: 'demo-cdk-dialog',
    hasBackdrop: defaultDialogConfig.hasBackdrop,
    backdropClass: defaultDialogConfig.backdropClass,
    width: defaultDialogConfig.width,
    height: defaultDialogConfig.height,
    minWidth: defaultDialogConfig.minWidth,
    minHeight: defaultDialogConfig.maxHeight,
    maxWidth: defaultDialogConfig.maxWidth,
    maxHeight: defaultDialogConfig.maxHeight,
    data: {
      message: 'Jazzy jazz jazz',
    },
  };
  numTemplateOpens = 0;

  @ViewChild(TemplateRef) template: TemplateRef<any>;

  readonly cdr = inject(ChangeDetectorRef);

  constructor(public dialog: Dialog) {}

  openJazz() {
    this.dialogRef = this.dialog.open<string>(JazzDialog, this.config);

    this.dialogRef.closed.subscribe(result => {
      this.result = result!;
      this.dialogRef = null;
      this.cdr.markForCheck();
    });
  }

  openTemplate() {
    this.numTemplateOpens++;
    this.dialogRef = this.dialog.open(this.template, this.config);

    this.dialogRef.closed.subscribe(result => {
      this.result = result!;
      this.dialogRef = null;
      this.cdr.markForCheck();
    });
  }
}

@Component({
  selector: 'demo-jazz-dialog',
  template: `
    <div>
      <p>It's Jazz!</p>

      <label for="how-much">How much?</label>
      <input id="how-much" #howMuch>

      <p>{{ data.message }}</p>
      <button type="button" (click)="dialogRef.close(howMuch.value)">Close dialog</button>
      <button (click)="togglePosition()">Change dimensions</button>
      <button (click)="temporarilyHide()">Hide for 2 seconds</button>
    </div>
  `,
  styles: `
    :host {
      background: white;
      padding: 20px;
      border-radius: 8px;
      display: block;
      width: 100%;
      height: 100%;
      min-width: inherit;
      min-height: inherit;
    }

    :host-context(.hidden-dialog) {
      opacity: 0;
    }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JazzDialog {
  private _dimensionToggle = false;

  constructor(
    public dialogRef: DialogRef<string>,
    @Inject(DIALOG_DATA) public data: any,
  ) {}

  togglePosition(): void {
    this._dimensionToggle = !this._dimensionToggle;

    if (this._dimensionToggle) {
      this.dialogRef.updateSize('500px', '500px');
    } else {
      this.dialogRef.updateSize().updatePosition();
    }
  }

  temporarilyHide(): void {
    this.dialogRef.addPanelClass('hidden-dialog');
    setTimeout(() => {
      this.dialogRef.removePanelClass('hidden-dialog');
    }, 2000);
  }
}
