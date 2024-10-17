import {Component} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

const today = new Date();

const formatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});

/** @title Listbox with complex object as values. */
@Component({
  selector: 'cdk-listbox-compare-with-example',
  exportAs: 'cdkListboxCompareWithExample',
  templateUrl: 'cdk-listbox-compare-with-example.html',
  styleUrl: 'cdk-listbox-compare-with-example.css',
  imports: [CdkListbox, CdkOption, JsonPipe],
})
export class CdkListboxCompareWithExample {
  slots = [12, 13, 14, 15].map(
    hour => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, hour),
  );

  appointment: readonly Date[] = [
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14),
  ];

  compareDate(date1: Date, date2: Date) {
    return date1.getTime() === date2.getTime();
  }

  formatTime(date: Date) {
    return formatter.format(date);
  }

  formatAppointment() {
    return this.appointment.map(a => this.formatTime(a));
  }
}
