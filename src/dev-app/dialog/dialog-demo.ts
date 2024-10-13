/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DragDropModule} from '@angular/cdk/drag-drop';
import {DOCUMENT, JsonPipe} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogConfig,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'dialog-demo',
  templateUrl: 'dialog-demo.html',
  styleUrl: 'dialog-demo.css',
  // View encapsulation is disabled since we add the legacy dialog padding
  // styles that need to target the dialog (not only the projected content).
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    JsonPipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    JsonPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogDemo {
  dialog = inject(MatDialog);

  dialogRef: MatDialogRef<JazzDialog> | null;
  lastAfterClosedResult: string;
  lastBeforeCloseResult: string;
  actionsAlignment: 'start' | 'center' | 'end';
  config = {
    disableClose: false,
    panelClass: 'custom-overlay-pane-class',
    hasBackdrop: true,
    backdropClass: '',
    width: '',
    height: '',
    minWidth: '',
    minHeight: '',
    maxWidth: '',
    maxHeight: '',
    position: {
      top: '',
      bottom: '',
      left: '',
      right: '',
    },
    data: {
      message: 'Jazzy jazz jazz',
    },
  };
  numTemplateOpens = 0;
  enableLegacyPadding = false;
  isScrollable = false;

  @ViewChild(TemplateRef) template: TemplateRef<any>;

  readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    const dialog = this.dialog;
    const doc = inject(DOCUMENT);

    // Possible useful example for the open and closeAll events.
    // Adding a class to the body if a dialog opens and
    // removing it after all open dialogs are closed
    dialog.afterOpened.subscribe(() => {
      if (!doc.body.classList.contains('no-scroll')) {
        doc.body.classList.add('no-scroll');
      }
    });
    dialog.afterAllClosed.subscribe(() => {
      doc.body.classList.remove('no-scroll');
    });
  }

  openJazz() {
    this.dialogRef = this.dialog.open(JazzDialog, this._getDialogConfig());

    this.dialogRef.beforeClosed().subscribe((result: string) => {
      this.lastBeforeCloseResult = result;
      this.cdr.markForCheck();
    });
    this.dialogRef.afterClosed().subscribe((result: string) => {
      this.lastAfterClosedResult = result;
      this.dialogRef = null;
      this.cdr.markForCheck();
    });
  }

  openContentElement() {
    const dialogRef = this.dialog.open(ContentElementDialog, this._getDialogConfig());
    dialogRef.componentInstance.actionsAlignment = this.actionsAlignment;
    dialogRef.componentInstance.isScrollable = this.isScrollable;
  }

  openTemplate() {
    this.numTemplateOpens++;
    this.dialog.open(this.template, this._getDialogConfig());
  }

  private _getDialogConfig(): MatDialogConfig {
    const config = {...this.config};
    if (this.enableLegacyPadding) {
      config.panelClass = `demo-dialog-legacy-padding`;
    }
    return config;
  }
}

@Component({
  selector: 'demo-jazz-dialog',
  template: `
    <div cdkDrag cdkDragRootElement=".cdk-overlay-pane">
      <p>Order printer ink refills.</p>

      <mat-form-field>
        <mat-label>How many?</mat-label>
        <input matInput #howMuch>
      </mat-form-field>

      <mat-form-field>
        <mat-label>What color?</mat-label>
        <mat-select #whatColor>
          <mat-option></mat-option>
          <mat-option value="black">Black</mat-option>
          <mat-option value="cyan">Cyan</mat-option>
          <mat-option value="magenta">Magenta</mat-option>
          <mat-option value="yellow">Yellow</mat-option>
        </mat-select>
      </mat-form-field>

      <p cdkDragHandle> {{ data.message }} </p>
      <button type="button" class="demo-dialog-button"
              (click)="dialogRef.close({ quantity: howMuch.value, color: whatColor.value })">

        Close dialog
      </button>
      <button (click)="togglePosition()">Change dimensions</button>
      <button (click)="temporarilyHide()">Hide for 2 seconds</button>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `.hidden-dialog { opacity: 0; }`,
  standalone: true,
  imports: [DragDropModule, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JazzDialog {
  dialogRef = inject<MatDialogRef<JazzDialog>>(MatDialogRef<JazzDialog>);
  data = inject(MAT_DIALOG_DATA);

  private _dimensionToggle = false;

  togglePosition(): void {
    this._dimensionToggle = !this._dimensionToggle;

    if (this._dimensionToggle) {
      this.dialogRef.updateSize('500px', '500px').updatePosition({top: '25px', left: '25px'});
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

@Component({
  selector: 'demo-content-element-dialog',
  styles: `
    img {
      max-width: 100%;
      max-height: 800px;
    }
  `,
  template: `
    <h2 mat-dialog-title>Neptune</h2>

    <mat-dialog-content>
      <p>
        Neptune is the eighth and farthest known planet from the Sun in the Solar System. In the
        Solar System, it is the fourth-largest planet by diameter, the third-most-massive planet,
        and the densest giant planet. Neptune is 17 times the mass of Earth and is slightly more
        massive than its near-twin Uranus, which is 15 times the mass of Earth and slightly larger
        than Neptune. Neptune orbits the Sun once every 164.8 years at an average distance of 30.1
        astronomical units (4.50x109 km). It is named after the Roman god of the sea and has the
        astronomical symbol ♆, a stylised version of the god Neptune's trident.
      </p>

      @if (isScrollable) {
        @for (i of [1, 2, 3]; track $index) {
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg"/>
        }
      }
    </mat-dialog-content>

    <mat-dialog-actions [align]="actionsAlignment">
      <button
        mat-button
        color="primary"
        mat-dialog-close>Close</button>

      <a
        mat-button
        color="primary"
        href="https://en.wikipedia.org/wiki/Neptune"
        target="_blank">Read more on Wikipedia</a>

      <button
        mat-button
        color="accent"
        (click)="showInStackedDialog()">
        Show in Dialog</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogClose, MatDialogActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentElementDialog {
  dialog = inject(MatDialog);

  actionsAlignment?: 'start' | 'center' | 'end';
  isScrollable: boolean;

  showInStackedDialog() {
    this.dialog.open(IFrameDialog, {maxWidth: '80vw'});
  }
}

@Component({
  selector: 'demo-iframe-dialog',
  styles: `
    iframe {
      width: 800px;
      height: 500px;
    }
  `,
  template: `
    <h2 mat-dialog-title>Neptune</h2>

    <mat-dialog-content>
      <iframe style="border: 0" src="https://en.wikipedia.org/wiki/Neptune"></iframe>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button
        mat-button
        color="primary"
        mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogClose, MatDialogActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IFrameDialog {}
