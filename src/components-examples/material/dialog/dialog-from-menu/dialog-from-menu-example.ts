import {ChangeDetectionStrategy, Component, inject, viewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
} from '@angular/material/dialog';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
/**
 * @title Dialog launched from a menu
 */
@Component({
  selector: 'dialog-from-menu-example',
  templateUrl: 'dialog-from-menu-example.html',
  imports: [MatButtonModule, MatMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogFromMenuExample {
  readonly menuTrigger = viewChild.required(MatMenuTrigger);

  readonly dialog = inject(MatDialog);

  openDialog() {
    // #docregion focus-restoration
    const dialogRef = this.dialog.open(DialogFromMenuExampleDialog, {restoreFocus: false});

    // Manually restore focus to the menu trigger since the element that
    // opens the dialog won't be in the DOM any more when the dialog closes.
    dialogRef.afterClosed().subscribe(() => this.menuTrigger().focus());
    // #enddocregion focus-restoration
  }
}

@Component({
  selector: 'dialog-from-menu-dialog',
  templateUrl: 'dialog-from-menu-example-dialog.html',
  imports: [MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogFromMenuExampleDialog {}
