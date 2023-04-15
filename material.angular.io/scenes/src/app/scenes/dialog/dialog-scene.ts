import {Component, ViewEncapsulation} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-dialog-scene',
  template: '',
  standalone: true
})
export class DialogScene {
  constructor(public dialog: MatDialog) {
    this.openDialog();
  }

  openDialog() {
    this.dialog.open(DialogSceneExampleDialog, {
      hasBackdrop: false
    });
  }
}


@Component({
  selector: 'app-dialog-scene-example-dialog',
  template: `
    <div mat-dialog-content>Discard draft?</div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button mat-dialog-close>Discard</button>
    </div>`,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class DialogSceneExampleDialog {}
