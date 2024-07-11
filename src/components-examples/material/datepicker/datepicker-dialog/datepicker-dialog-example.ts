import {ChangeDetectionStrategy, Component, Inject, model} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DATE_FORMATS,
  MAT_NATIVE_DATE_FORMATS,
  provideNativeDateAdapter,
} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

export interface DialogData {
  selectedDate: Date;
}

/** @title Datepicker inside a MatDialog */
@Component({
  selector: 'datepicker-dialog-example',
  templateUrl: 'datepicker-dialog-example.html',
  standalone: true,
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDialogExample {
  selectedDate = model<Date | null>(null);

  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(DatepickerDialogExampleDialog, {
      minWidth: '500px',
      data: {selectedDate: this.selectedDate()},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.selectedDate.set(result);
    });
  }
}

@Component({
  selector: 'datepicker-dialog-example',
  templateUrl: 'datepicker-dialog-example-dialog.html',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  providers: [
    provideNativeDateAdapter(),
    {provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS},
  ],
})
export class DatepickerDialogExampleDialog {
  readonly date = new FormControl(new Date());

  constructor(
    public dialogRef: MatDialogRef<DatepickerDialogExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.date.setValue(data.selectedDate);
  }
}
