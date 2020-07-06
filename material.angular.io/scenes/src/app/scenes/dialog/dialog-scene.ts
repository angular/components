import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-dialog-scene',
  templateUrl: './dialog-scene.html'
})
export class DialogScene {
  constructor(public dialog: MatDialog) {
    this.openDialog();
  }

  openDialog() {
    this.dialog.open(DialogSceneExampleDialog, {
      height: '190px',
      width: '300px'
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
    <h1 mat-dialog-title>Reset settings</h1>
    <div mat-dialog-content>This will reset your device to its default factory settings.</div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button mat-dialog-close>Accept</button>
    </div>`
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
