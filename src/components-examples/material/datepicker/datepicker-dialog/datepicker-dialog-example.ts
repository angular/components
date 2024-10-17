import {ChangeDetectionStrategy, Component, model, inject} from '@angular/core';
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
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDialogExample {
  dialog = inject(MatDialog);

  selectedDate = model<Date | null>(null);

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
  dialogRef = inject<MatDialogRef<DatepickerDialogExampleDialog>>(
    MatDialogRef<DatepickerDialogExampleDialog>,
  );
  data = inject(MAT_DIALOG_DATA);

  readonly date = new FormControl(new Date());

  constructor() {
    const data = this.data;

    this.date.setValue(data.selectedDate);
  }
}
