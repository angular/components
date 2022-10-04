import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyDialog as MatDialog, MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-dialog-scene',
  template: ''
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

@NgModule({
  imports: [
    MatButtonModule
  ],
  exports: [DialogScene],
  declarations: [DialogScene]
})
export class DialogSceneModule {
}

@Component({
  selector: 'app-dialog-scene-example-dialog',
  template: `
    <div mat-dialog-content>Discard draft?</div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button mat-dialog-close>Discard</button>
    </div>`,
})
export class DialogSceneExampleDialog {}

@NgModule({
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  exports: [DialogSceneExampleDialog],
  declarations: [DialogSceneExampleDialog]
})
export class DialogSceneExampleDialogModule {
}
