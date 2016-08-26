//import {
//  Component,
//  Input,
//} from '@angular/core';

//@Component({
//  moduleId: module.id,
//  selector: 'md-calendar',
//  templateUrl: 'calendar.html'
//})
//export class MdCalendar {

//  @Input('model-format') modelFormat: string;
//  // picker: '=',
//  //date: '='

//  //  var YEAR_MIN = 1900,
//  //  YEAR_MAX = 2100,
//  //  MONTHS_IN_ALL = (YEAR_MAX - YEAR_MIN + 1) * 12,
//  //  ITEM_HEIGHT = 240,
//  //  MONTHS = [];
//  //for (var i = 0; i < MONTHS_IN_ALL; i++) {
//  //  MONTHS.push(i);
//  //}

//  //var currentMonthIndex = function (date) {
//  //  var year = date.year();
//  //  var month = date.month();
//  //  return ((year - YEAR_MIN) * 12) + month - 1;
//  //};


//  private test(): void {
//  }

//  //  var calendar = this,
//  //  picker = this.picker,
//  //  days = [];

//  //for (var i = picker.params.weekStart; days.length < 7; i++) {
//  //  if (i > 6) {
//  //    i = 0;
//  //  }
//  //  days.push(i.toString());
//  //}

//  //calendar.week = days;
//  //if (!picker.maxDate && !picker.minDate) {
//  //  calendar.months = MONTHS;
//  //} else {
//  //  var low = picker.minDate ? currentMonthIndex(picker.minDate) : 0;
//  //  var high = picker.maxDate ? (currentMonthIndex(picker.maxDate) + 1) : MONTHS_IN_ALL;
//  //  calendar.months = MONTHS.slice(low, high);
//  //}


//  //calendar.getItemAtIndex = function (index) {
//  //  var month = ((index + 1) % 12) || 12;
//  //  var year = YEAR_MIN + Math.floor(index / 12);
//  //  var monthObj = moment(picker.currentDate)
//  //    .year(year)
//  //    .month(month);
//  //  return generateMonthCalendar(monthObj);
//  //};

//  //calendar.topIndex = currentMonthIndex(picker.currentDate) - calendar.months[0];

//  //$scope.$watch(function () {
//  //  return picker.currentDate ? picker.currentDate.format('YYYY-MM') : '';
//  //}, function (val2, val1) {
//  //  if (val2 != val1) {
//  //    var nDate = moment(val2, 'YYYY-MM');
//  //    var index = currentMonthIndex(nDate) - calendar.months[0];
//  //    if (calendar.topIndex != index) {
//  //      calendar.topIndex = index;
//  //    }
//  //  }
//  //});

//  //var generateMonthCalendar = function (date) {
//  //  var month = {};
//  //  if (date !== null) {
//  //    month.name = date.format('MMMM YYYY');
//  //    var startOfMonth = moment(date).locale(picker.params.lang).startOf('month')
//  //      .hour(date.hour())
//  //      .minute(date.minute())
//  //      ;
//  //    var iNumDay = startOfMonth.format('d');
//  //    month.days = [];
//  //    for (var i = startOfMonth.date(); i <= startOfMonth.daysInMonth(); i++) {
//  //      if (i === startOfMonth.date()) {
//  //        var iWeek = calendar.week.indexOf(iNumDay.toString());
//  //        if (iWeek > 0) {
//  //          for (var x = 0; x < iWeek; x++) {
//  //            month.days.push(0);
//  //          }
//  //        }
//  //      }
//  //      month.days.push(moment(startOfMonth).locale(picker.params.lang).date(i));
//  //    }

//  //    var daysInAWeek = 7, daysTmp = [], slices = Math.ceil(month.days.length / daysInAWeek);
//  //    for (var j = 0; j < slices; j++) {
//  //      daysTmp.push(month.days.slice(j * daysInAWeek, (j + 1) * daysInAWeek));
//  //    }
//  //    month.days = daysTmp;
//  //    return month;
//  //  }

//  //};

//  //calendar.toDay = function (i) {
//  //  return moment(parseInt(i), "d")
//  //    .locale(picker.params.lang)
//  //    .format("dd")
//  //    .substring(0, 1);
//  //};

//  //calendar.isInRange = function (date) {
//  //  return picker.isAfterMinDate(moment(date), false, false)
//  //    && picker.isBeforeMaxDate(moment(date), false, false);
//  //};

//  //calendar.selectDate = function (date) {
//  //  if (date) {
//  //    if (calendar.isSelectedDay(date)) {
//  //      return picker.ok();
//  //    }
//  //    picker.selectDate(moment(date).hour(calendar.date.hour()).minute(calendar.date.minute()));
//  //  }
//  //};

//  //calendar.isSelectedDay = function (m) {
//  //  return m && calendar.date.date() === m.date() && calendar.date.month() === m.month() && calendar.date.year() === m.year();
//  //};

//}