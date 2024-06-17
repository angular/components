import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerInputEvent, MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

/** @title Datepicker input and change events */
@Component({
  selector: 'datepicker-events-example',
  templateUrl: 'datepicker-events-example.html',
  styleUrl: 'datepicker-events-example.css',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerEventsExample {
  events = signal<string[]>([]);

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.events.update(events => [...events, `${type}: ${event.value}`]);
  }
}
