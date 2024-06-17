import {ChangeDetectionStrategy, Component, model} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';

/** @title Datepicker inline calendar example */
@Component({
  selector: 'datepicker-inline-calendar-example',
  templateUrl: 'datepicker-inline-calendar-example.html',
  styleUrl: 'datepicker-inline-calendar-example.css',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatCardModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerInlineCalendarExample {
  selected = model<Date | null>(null);
}
