import {
  Component,
  Input,
} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'md-calendar-month',
  templateUrl: 'calendarMonth.html'
})
export class MdCalendarMonth {

  //@Input() type: 'date' | 'time' | 'datetime' | 'month' = 'date';
  //@Input() disabled: boolean;
  //@Input() readonly: boolean;
  //@Input() required: boolean;
  //@Input() name: string = '';
  //@Input() id: string = '1';
  //@Input() min: number;
  //@Input() max: number;
  //@Input() value: string;
  //@Input() placeholder: string;
  //@Input() format: string;

  //@Input() month: Object;

  //private cal = calendar;
  //private month = calendar.getItemAtIndex(parseInt(scope.idx));
  //buildCalendarContent(element, scope);

  //private buildCalendarContent(element, scope) {
  //  var tbody = angular.element(element[0].querySelector('tbody'));
  //  var calendar = scope.cal, month = scope.month;
  //  tbody.html('');
  //  month.days.forEach(function (weekDays, i) {
  //    var tr = angular.element('<tr></tr>');
  //    weekDays.forEach(function (weekDay, j) {
  //      var td = angular.element('<td> </td>');
  //      if (weekDay) {
  //        var aOrSpan;
  //        if (calendar.isInRange(weekDay)) {
  //          //build a
  //          var scopeRef = 'month["days"][' + i + '][' + j + ']';
  //          aOrSpan = angular.element("<a href='#' mdc-dtp-noclick></a>")
  //            .attr('ng-class', '{selected: cal.isSelectedDay(' + scopeRef + ')}')
  //            .attr('ng-click', 'cal.selectDate(' + scopeRef + ')')
  //            ;
  //        } else {
  //          aOrSpan = angular.element('<span></span>')
  //        }
  //        aOrSpan
  //          .addClass('dtp-select-day')
  //          .html(weekDay.format('D'));
  //        td.append(aOrSpan);
  //      }
  //      tr.append(td);
  //    });
  //    tbody.append(tr);
  //  });
  //  $compile(tbody)(scope);
  //}

  //private selectDate(day: any) {
  //  console.log(day);
  //}

  @Input() month: Date;
  @Input() selectedDate: Date;
  @Input() focusedDate: Date;
  @Input() ignoreTaps: boolean;
  @Input() _notTapping: boolean;

  private _getTitle(month: Date, monthNames: any) {
    return this.formatTitle(monthNames[month.getMonth()], month.getFullYear());
  }
  private _dateEquals(date1: Date, date2: Date) {
    if (date1 && date2) {
      return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
    } else {
      return false;
    }
  }
  private _dateAdd(date: Date, delta: any) {
    date.setDate(date.getDate() + delta);
  }
  private _getWeekDayNames(weekDayNames: any, firstDayOfWeek: any) {
    return weekDayNames.slice(firstDayOfWeek).concat(weekDayNames.slice(0, firstDayOfWeek));
  }
  private _getDate(date: Date) {
    return date ? date.getDate() : '';
  }
  private _isToday(date: Date) {
    return this._dateEquals(new Date(), date);
  }
  private _getDays() {
    // First day of the month (at midnight).
    let date = new Date(0, 0);
    date.setFullYear(this.month.getFullYear());
    date.setMonth(this.month.getMonth());
    date.setDate(1);
    // Rewind to first day of the week.
    while (date.getDay() !== this.firstDayOfWeek) {
      this._dateAdd(date, -1);
    }
    let days: any = [];
    let startMonth = date.getMonth();
    let targetMonth = this.month.getMonth();
    while (date.getMonth() === targetMonth || date.getMonth() === startMonth) {
      days.push(date.getMonth() === targetMonth ? new Date(date.getTime()) : null);
      // Advance to next day.
      this._dateAdd(date, 1);
    }
    return days;
  }



  private monthNames = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ];
  private weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  private firstDayOfWeek = 0;
  private today = 'Today';
  private cancel = 'Cancel';
  private formatDate(d: Date) {
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
  }
  private formatTitle(monthName: any, fullYear: any) {
    return monthName + ' ' + fullYear;
  }
}
