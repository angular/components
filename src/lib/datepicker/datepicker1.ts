//'use strict';
//var moduleName = "ngMaterialDatePicker";

//var VIEW_STATES = {
//  DATE: 0,
//  HOUR: 1,
//  MINUTE: 2
//};

//var css = function (el, name) {
//  if ('jQuery' in window) {
//    return jQuery(el).css(name);
//  } else {
//    el = angular.element(el);
//    return ('getComputedStyle' in window) ? window.getComputedStyle(el[0])[name] : el.css(name);
//  }
//};

//var template = '<md-dialog class="dtp" layout="column" style="width: 300px;">'
//  + '    <md-dialog-content class="dtp-content">'
//  + '        <div class="dtp-date-view">'
//  + '            <header class="dtp-header">'
//  + '                <div class="dtp-actual-day" ng-show="picker.dateMode">{{picker.currentDate.format("dddd")}}</div>'
//  + '                <div class="dtp-actual-day" ng-show="picker.timeMode">{{picker.params.shortTime ? picker.currentDate.format("A") : " "}}</div>'
//  + '                <div class="dtp-close text-right">'
//  + '                    <a href="#" mdc-dtp-noclick ng-click="picker.hide()">&times;</a>'
//  + '                </div>'
//  + '            </header>'
//  + '            <div class="dtp-date" ng-show="picker.params.date">'
//  + '                <div layout="column">'
//  + '                    <div class="dtp-actual-month">{{picker.currentDate.format("MMM") | uppercase}}</div>'
//  + '                </div>'
//  + '                <div class="dtp-actual-num">{{picker.currentDate.format("DD")}}</div>'
//  + '                <div layout="row">'
//  + ' <div ng-click="picker.incrementYear(-1)" class="dtp-year-btn dtp-year-btn-prev" flex="30"><span ng-if="picker.isPreviousYearVisible()" >&#x25B2;</span></div>'
//  + '                    <div class="dtp-actual-year" flex>{{picker.currentDate.format("YYYY")}}</div>'
//  + ' <div ng-click="picker.incrementYear(1)" class="dtp-year-btn dtp-year-btn-next" flex="30"><span ng-if="picker.isNextYearVisible()" >&#x25BC;</span></div>'
//  + '                </div>'
//  + '            </div>'//start time
//  + '            <div class="dtp-time" ng-show="picker.params.time && !picker.params.date">'
//  + '                <div class="dtp-actual-maxtime">{{picker.currentNearest5Minute().format(picker.params.shortTime ? "hh:mm" : "HH:mm")}}</div>'
//  + '            </div>'
//  + '            <div class="dtp-picker">'
//  + '                <mdc-datetime-picker-calendar date="picker.currentDate" picker="picker" class="dtp-picker-calendar" ng-show="picker.currentView === picker.VIEWS.DATE"></mdc-datetime-picker-calendar>'
//  + '                <div class="dtp-picker-datetime" ng-show="picker.currentView !== picker.VIEWS.DATE">'
//  + '                    <div class="dtp-actual-meridien">'
//  + '                        <div class="left p20">'
//  + '                            <a href="#" mdc-dtp-noclick class="dtp-meridien-am" ng-class="{selected: picker.meridien == \'AM\'}" ng-click="picker.selectAM()">{{picker.params.amText}}</a>'
//  + '                        </div>'
//  + '                        <div ng-show="!picker.timeMode" class="dtp-actual-time p60">{{picker.currentNearest5Minute().format(picker.params.shortTime ? "hh:mm" : "HH:mm")}}</div>'
//  + '                        <div class="right p20">'
//  + '                            <a href="#" mdc-dtp-noclick class="dtp-meridien-pm" ng-class="{selected: picker.meridien == \'PM\'}" ng-click="picker.selectPM()">{{picker.params.pmText}}</a>'
//  + '                        </div>'
//  + '                        <div class="clearfix"></div>'
//  + '                    </div>'
//  + '                    <mdc-datetime-picker-clock mode="hours" ng-if="picker.currentView === picker.VIEWS.HOUR"></mdc-datetime-picker-clock>'
//  + '                    <mdc-datetime-picker-clock mode="minutes" ng-if="picker.currentView === picker.VIEWS.MINUTE"></mdc-datetime-picker-clock>'
//  + '                </div>'
//  + '            </div>'
//  + '        </div>'
//  + '    </md-dialog-content>'
//  + '    <md-dialog-actions class="dtp-buttons">'
//  + '            <md-button class="dtp-btn-cancel md-button" ng-click="picker.cancel()"> {{picker.params.cancelText}}</md-button>'
//  + '            <md-button class="dtp-btn-ok md-button" ng-click="picker.ok()"> {{picker.params.okText}}</md-button>'
//  + '      </md-dialog-actions>'
//  + '</md-dialog>';

//angular.module(moduleName, ['ngMaterial'])
//  .provider('mdcDatetimePickerDefaultLocale', function () {
//    this.locale = 'en';

//    this.$get = function () {
//      return this.locale;
//    };

//    this.setDefaultLocale = function (localeString) {
//      this.locale = localeString;
//    };
//  })
//  .directive('mdcDatetimePicker', ['$mdDialog',
//    function ($mdDialog) {

//      return {
//        restrict: 'A',
//        require: 'ngModel',
//        scope: {
//          currentDate: '=ngModel',
//          time: '=',
//          date: '=',
//          minDate: '=',
//          maxDate: '=',
//          shortTime: '=',
//          format: '@',
//          cancelText: '@',
//          okText: '@',
//          lang: '@',
//          amText: '@',
//          pmText: '@'
//        },
//        link: function (scope, element, attrs, ngModel) {
//          var isOn = false;
//          if (!scope.format) {
//            if (scope.date && scope.time) {
//              scope.format = 'YYYY-MM-DD HH:mm:ss';
//            } else if (scope.date) {
//              scope.format = 'YYYY-MM-DD';
//            } else {
//              scope.format = 'HH:mm';
//            }
//          }

//          if (angular.isString(scope.currentDate) && scope.currentDate !== '') {
//            scope.currentDate = moment(scope.currentDate, scope.format);
//          }

//          if (ngModel) {
//            ngModel.$formatters.push(function (value) {
//              if (typeof value === 'undefined') {
//                return;
//              }
//              var m = moment(value);
//              return m.isValid() ? m.format(scope.format) : '';
//            });
//          }

//          element.attr('readonly', '');
//          //@TODO custom event to trigger input
//          element.on('focus', function (e) {
//            e.preventDefault();
//            element.blur();
//            if (isOn) {
//              return;
//            }
//            isOn = true;
//            var options = {};
//            for (var i in attrs) {
//              if (scope.hasOwnProperty(i) && !angular.isUndefined(scope[i])) {
//                options[i] = scope[i];
//              }
//            }
//            options.currentDate = scope.currentDate;
//            var locals = { options: options };
//            $mdDialog.show({
//              template: template,
//              controller: PluginController,
//              controllerAs: 'picker',
//              locals: locals,
//              openFrom: element,
//              parent: angular.element(document.body),
//              bindToController: true,
//              disableParentScroll: false,
//              skipHide: true
//            })
//              .then(function (v) {
//                scope.currentDate = v ? v._d : v;
//                isOn = false;
//              }, function () {
//                isOn = false;
//              })
//              ;
//          });
//        }
//      };
//    }])
//  ;

//var PluginController = function ($scope, $mdDialog, mdcDatetimePickerDefaultLocale) {
//  this.currentView = VIEW_STATES.DATE;
//  this._dialog = $mdDialog;

//  this.minDate;
//  this.maxDate;

//  this._attachedEvents = [];
//  this.VIEWS = VIEW_STATES;

//  this.params = {
//    date: true,
//    time: true,
//    format: 'YYYY-MM-DD',
//    minDate: null,
//    maxDate: null,
//    currentDate: null,
//    lang: mdcDatetimePickerDefaultLocale,
//    weekStart: 0,
//    shortTime: false,
//    cancelText: 'Cancel',
//    okText: 'OK',
//    amText: 'AM',
//    pmText: 'PM'
//  };

//  this.meridien = 'AM';
//  this.params = angular.extend(this.params, this.options);
//  this.init();
//};
//PluginController.$inject = ['$scope', '$mdDialog', 'mdcDatetimePickerDefaultLocale'];
//PluginController.prototype = {
//  init: function () {
//    this.timeMode = this.params.time && !this.params.date;
//    this.dateMode = this.params.date;
//    this.initDates();
//    this.start();
//  },
//  currentNearest5Minute: function () {
//    var date = this.currentDate || moment();
//    var minutes = (5 * Math.round(date.minute() / 5));
//    if (minutes >= 60) {
//      minutes = 55; //always push down
//    }
//    return moment(date).minutes(minutes);
//  },
//  initDates: function () {
//    var that = this;
//    var _dateParam = function (input, fallback) {
//      var ret = null;
//      if (angular.isDefined(input) && input !== null && input !== '') {
//        if (angular.isString(input)) {
//          if (typeof (that.params.format) !== 'undefined' && that.params.format !== null) {
//            ret = moment(input, that.params.format).locale(that.params.lang);
//          }
//          else {
//            ret = moment(input).locale(that.params.lang);
//          }
//        }
//        else {
//          if (angular.isDate(input)) {
//            var x = input.getTime();
//            ret = moment(x, "x").locale(that.params.lang);
//          } else if (input._isAMomentObject) {
//            ret = input;
//          }
//        }
//      }
//      else {
//        ret = fallback;
//      }
//      return ret;
//    };

//    this.currentDate = _dateParam(this.params.currentDate, moment());
//    this.minDate = _dateParam(this.params.minDate);
//    this.maxDate = _dateParam(this.params.maxDate);
//    this.selectDate(this.currentDate);
//  },
//  initDate: function (d) {
//    this.currentView = VIEW_STATES.DATE;
//  },
//  initHours: function () {
//    this.currentView = VIEW_STATES.HOUR;
//  },
//  initMinutes: function () {
//    this.currentView = VIEW_STATES.MINUTE;
//  },
//  isAfterMinDate: function (date, checkHour, checkMinute) {
//    var _return = true;

//    if (typeof (this.minDate) !== 'undefined' && this.minDate !== null) {
//      var _minDate = moment(this.minDate);
//      var _date = moment(date);

//      if (!checkHour && !checkMinute) {
//        _minDate.hour(0);
//        _minDate.minute(0);

//        _date.hour(0);
//        _date.minute(0);
//      }

//      _minDate.second(0);
//      _date.second(0);
//      _minDate.millisecond(0);
//      _date.millisecond(0);

//      if (!checkMinute) {
//        _date.minute(0);
//        _minDate.minute(0);

//        _return = (parseInt(_date.format("X")) >= parseInt(_minDate.format("X")));
//      }
//      else {
//        _return = (parseInt(_date.format("X")) >= parseInt(_minDate.format("X")));
//      }
//    }

//    return _return;
//  },
//  isBeforeMaxDate: function (date, checkTime, checkMinute) {
//    var _return = true;

//    if (typeof (this.maxDate) !== 'undefined' && this.maxDate !== null) {
//      var _maxDate = moment(this.maxDate);
//      var _date = moment(date);

//      if (!checkTime && !checkMinute) {
//        _maxDate.hour(0);
//        _maxDate.minute(0);

//        _date.hour(0);
//        _date.minute(0);
//      }

//      _maxDate.second(0);
//      _date.second(0);
//      _maxDate.millisecond(0);
//      _date.millisecond(0);

//      if (!checkMinute) {
//        _date.minute(0);
//        _maxDate.minute(0);

//        _return = (parseInt(_date.format("X")) <= parseInt(_maxDate.format("X")));
//      }
//      else {
//        _return = (parseInt(_date.format("X")) <= parseInt(_maxDate.format("X")));
//      }
//    }

//    return _return;
//  },
//  selectDate: function (date) {
//    if (date) {
//      this.currentDate = moment(date);
//      if (!this.isAfterMinDate(this.currentDate)) {
//        this.currentDate = moment(this.minDate);
//      }

//      if (!this.isBeforeMaxDate(this.currentDate)) {
//        this.currentDate = moment(this.maxDate);
//      }
//      this.currentDate.locale(this.params.lang);
//      this.calendarStart = moment(this.currentDate);
//      this.meridien = this.currentDate.hour() >= 12 ? 'PM' : 'AM';
//    }
//  },
//  setName: function () {
//    var text = "";
//    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//    for (var i = 0; i < 5; i++) {
//      text += possible.charAt(Math.floor(Math.random() * possible.length));
//    }

//    return text;
//  },
//  isPM: function () {
//    return this.meridien === 'PM';
//  },
//  incrementYear: function (amount) {
//    if (amount === 1 && this.isNextYearVisible()) {
//      this.selectDate(this.currentDate.add(amount, 'year'));
//    }

//    if (amount === -1 && this.isPreviousYearVisible()) {
//      this.selectDate(this.currentDate.add(amount, 'year'));
//    }
//  },
//  isPreviousMonthVisible: function () {
//    return this.calendarStart && this.isAfterMinDate(moment(this.calendarStart).startOf('month'), false, false);
//  },
//  isNextMonthVisible: function () {
//    return this.calendarStart && this.isBeforeMaxDate(moment(this.calendarStart).endOf('month'), false, false);
//  },
//  isPreviousYearVisible: function () {
//    return this.calendarStart && this.isAfterMinDate(moment(this.calendarStart).startOf('year'), false, false);
//  },
//  isNextYearVisible: function () {
//    return this.calendarStart && this.isBeforeMaxDate(moment(this.calendarStart).endOf('year'), false, false);
//  },
//  isHourAvailable: function (hour) {
//    var _date = moment(this.currentDate);
//    _date.hour(this.convertHours(hour)).minute(0).second(0);
//    return this.isAfterMinDate(_date, true, false) && this.isBeforeMaxDate(_date, true, false);
//  },
//  isMinuteAvailable: function (minute) {
//    var _date = moment(this.currentDate);
//    _date.minute(minute).second(0);
//    return this.isAfterMinDate(_date, true, true) && this.isBeforeMaxDate(_date, true, true);
//  },
//  start: function () {
//    this.currentView = VIEW_STATES.DATE;
//    //this.initDates();
//    if (this.params.date) {
//      this.initDate();
//    } else {
//      if (this.params.time) {
//        this.initHours();
//      }
//    }
//  },
//  ok: function () {
//    switch (this.currentView) {
//      case VIEW_STATES.DATE:
//        if (this.params.time === true) {
//          this.initHours();
//        }
//        else {
//          this.hide(true);
//        }
//        break;
//      case VIEW_STATES.HOUR:
//        this.initMinutes();
//        break;
//      case VIEW_STATES.MINUTE:
//        this.hide(true);
//        break;
//    }
//  },
//  cancel: function () {
//    if (this.params.time) {
//      switch (this.currentView) {
//        case VIEW_STATES.DATE:
//          this.hide();
//          break;
//        case VIEW_STATES.HOUR:
//          if (this.params.date) {
//            this.initDate();
//          }
//          else {
//            this.hide();
//          }
//          break;
//        case VIEW_STATES.MINUTE:
//          this.initHours();
//          break;
//      }
//    }
//    else {
//      this.hide();
//    }
//  },
//  selectMonthBefore: function () {
//    this.calendarStart.subtract(1, 'months');
//  },
//  selectMonthAfter: function () {
//    this.calendarStart.add(1, 'months');
//  },
//  selectYearBefore: function () {
//    this.calendarStart.subtract(1, 'years');
//  },
//  selectYearAfter: function () {
//    this.calendarStart.add(1, 'years');
//  },
//  selectAM: function () {
//    if (this.isHourAvailable(0) || this.isHourAvailable(12)) {
//      if (this.currentDate.hour() >= 12) {
//        this.selectDate(this.currentDate.subtract(12, 'hours'));
//      }
//      if (!this.isHourAvailable(this.currentDate.hour())) {
//        this.selectDate(this.currentDate.hour(this.minDate.hour()));
//      }
//      if (!this.isMinuteAvailable(this.currentDate.minute())) {
//        this.selectDate(this.currentDate.minute(this.minDate.minute()));
//      }
//    }
//  },
//  selectPM: function () {
//    if (this.isHourAvailable(13) || this.isHourAvailable(24)) {
//      if (this.currentDate.hour() < 12) {
//        this.selectDate(this.currentDate.add(12, 'hours'));
//      }
//      if (!this.isHourAvailable(this.currentDate.hour())) {
//        this.selectDate(this.currentDate.hour(this.maxDate.hour()));
//      }
//      if (!this.isMinuteAvailable(this.currentDate.minute())) {
//        this.selectDate(this.currentDate.minute(this.maxDate.minute()));
//      }
//    }
//  },
//  convertHours: function (h) {
//    var _return = h;
//    if ((h < 12) && this.isPM())
//      _return += 12;

//    return _return;
//  },
//  hide: function (okBtn) {
//    if (okBtn) {
//      this._dialog.hide(this.currentDate);
//    } else {
//      this._dialog.cancel();
//    }
//  }
//};


//angular.module(moduleName)
//  .directive('mdcDatetimePickerCalendar', [
//    function () {

//      var YEAR_MIN = 1900,
//        YEAR_MAX = 2100,
//        MONTHS_IN_ALL = (YEAR_MAX - YEAR_MIN + 1) * 12,
//        ITEM_HEIGHT = 240,
//        MONTHS = [];
//      for (var i = 0; i < MONTHS_IN_ALL; i++) {
//        MONTHS.push(i);
//      }

//      var currentMonthIndex = function (date) {
//        var year = date.year();
//        var month = date.month();
//        return ((year - YEAR_MIN) * 12) + month - 1;
//      };

//      return {
//        restrict: 'E',
//        scope: {
//          picker: '=',
//          date: '='
//        },
//        bindToController: true,
//        controllerAs: 'cal',
//        controller: ['$scope',
//          function ($scope) {
//            var calendar = this,
//              picker = this.picker,
//              days = [];

//            for (var i = picker.params.weekStart; days.length < 7; i++) {
//              if (i > 6) {
//                i = 0;
//              }
//              days.push(i.toString());
//            }

//            calendar.week = days;
//            if (!picker.maxDate && !picker.minDate) {
//              calendar.months = MONTHS;
//            } else {
//              var low = picker.minDate ? currentMonthIndex(picker.minDate) : 0;
//              var high = picker.maxDate ? (currentMonthIndex(picker.maxDate) + 1) : MONTHS_IN_ALL;
//              calendar.months = MONTHS.slice(low, high);
//            }


//            calendar.getItemAtIndex = function (index) {
//              var month = ((index + 1) % 12) || 12;
//              var year = YEAR_MIN + Math.floor(index / 12);
//              var monthObj = moment(picker.currentDate)
//                .year(year)
//                .month(month);
//              return generateMonthCalendar(monthObj);
//            };

//            calendar.topIndex = currentMonthIndex(picker.currentDate) - calendar.months[0];

//            $scope.$watch(function () {
//              return picker.currentDate ? picker.currentDate.format('YYYY-MM') : '';
//            }, function (val2, val1) {
//              if (val2 != val1) {
//                var nDate = moment(val2, 'YYYY-MM');
//                var index = currentMonthIndex(nDate) - calendar.months[0];
//                if (calendar.topIndex != index) {
//                  calendar.topIndex = index;
//                }
//              }
//            });

//            var generateMonthCalendar = function (date) {
//              var month = {};
//              if (date !== null) {
//                month.name = date.format('MMMM YYYY');
//                var startOfMonth = moment(date).locale(picker.params.lang).startOf('month')
//                  .hour(date.hour())
//                  .minute(date.minute())
//                  ;
//                var iNumDay = startOfMonth.format('d');
//                month.days = [];
//                for (var i = startOfMonth.date(); i <= startOfMonth.daysInMonth(); i++) {
//                  if (i === startOfMonth.date()) {
//                    var iWeek = calendar.week.indexOf(iNumDay.toString());
//                    if (iWeek > 0) {
//                      for (var x = 0; x < iWeek; x++) {
//                        month.days.push(0);
//                      }
//                    }
//                  }
//                  month.days.push(moment(startOfMonth).locale(picker.params.lang).date(i));
//                }

//                var daysInAWeek = 7, daysTmp = [], slices = Math.ceil(month.days.length / daysInAWeek);
//                for (var j = 0; j < slices; j++) {
//                  daysTmp.push(month.days.slice(j * daysInAWeek, (j + 1) * daysInAWeek));
//                }
//                month.days = daysTmp;
//                return month;
//              }

//            };

//            calendar.toDay = function (i) {
//              return moment(parseInt(i), "d")
//                .locale(picker.params.lang)
//                .format("dd")
//                .substring(0, 1);
//            };

//            calendar.isInRange = function (date) {
//              return picker.isAfterMinDate(moment(date), false, false)
//                && picker.isBeforeMaxDate(moment(date), false, false);
//            };

//            calendar.selectDate = function (date) {
//              if (date) {
//                if (calendar.isSelectedDay(date)) {
//                  return picker.ok();
//                }
//                picker.selectDate(moment(date).hour(calendar.date.hour()).minute(calendar.date.minute()));
//              }
//            };

//            calendar.isSelectedDay = function (m) {
//              return m && calendar.date.date() === m.date() && calendar.date.month() === m.month() && calendar.date.year() === m.year();
//            };

//          }
//        ],
//        template: '<md-virtual-repeat-container md-top-index="cal.topIndex" class="months">' +
//        '<div md-virtual-repeat="idx in cal.months" md-start-index="cal.topIndex" md-item-size="' + ITEM_HEIGHT + '">' +
//        '     <div mdc-datetime-picker-calendar-month idx="idx"></div>' +
//        '</div>' +
//        '</md-virtual-repeat-container>'
//      };
//    }])
//  .directive('mdcDatetimePickerCalendarMonth', ['$compile',
//    function ($compile) {
//      var buildCalendarContent = function (element, scope) {
//        var tbody = angular.element(element[0].querySelector('tbody'));
//        var calendar = scope.cal, month = scope.month;
//        tbody.html('');
//        month.days.forEach(function (weekDays, i) {
//          var tr = angular.element('<tr></tr>');
//          weekDays.forEach(function (weekDay, j) {
//            var td = angular.element('<td> </td>');
//            if (weekDay) {
//              var aOrSpan;
//              if (calendar.isInRange(weekDay)) {
//                //build a
//                var scopeRef = 'month["days"][' + i + '][' + j + ']';
//                aOrSpan = angular.element("<a href='#' mdc-dtp-noclick></a>")
//                  .attr('ng-class', '{selected: cal.isSelectedDay(' + scopeRef + ')}')
//                  .attr('ng-click', 'cal.selectDate(' + scopeRef + ')')
//                  ;
//              } else {
//                aOrSpan = angular.element('<span></span>')
//              }
//              aOrSpan
//                .addClass('dtp-select-day')
//                .html(weekDay.format('D'));
//              td.append(aOrSpan);
//            }
//            tr.append(td);
//          });
//          tbody.append(tr);
//        });
//        $compile(tbody)(scope);
//      };

//      return {
//        scope: {
//          idx: '='
//        },
//        require: '^mdcDatetimePickerCalendar',
//        restrict: 'AE',
//        template: '<div class="dtp-picker-month">{{month.name}}</div>'
//        + '<table class="table dtp-picker-days">'
//        + '    <thead>'
//        + '    <tr>'
//        + '        <th ng-repeat="day in cal.week">{{cal.toDay(day)}}</th>'
//        + '    </tr>'
//        + '    </thead>'
//        + '    <tbody>'
//        + '    </tbody>'
//        + '</table>',
//        link: function (scope, element, attrs, calendar) {
//          scope.cal = calendar;
//          scope.month = calendar.getItemAtIndex(parseInt(scope.idx));
//          buildCalendarContent(element, scope);
//          scope.$watch(function () {
//            return scope.idx;
//          }, function (idx, oldIdx) {
//            if (idx != oldIdx) {
//              scope.month = calendar.getItemAtIndex(parseInt(scope.idx));
//              buildCalendarContent(element, scope);
//            }
//          });
//        }
//      };
//    }
//  ])
//  ;

//angular.module(moduleName)
//  .directive('mdcDtpNoclick', function () {
//    return {
//      link: function (scope, el) {
//        el.on('click', function (e) {
//          e.preventDefault();
//        });
//      }
//    };
//  });
//angular.module(moduleName)
//  .directive('mdcDatetimePickerClock', [
//    function () {

//      var template = '<div class="dtp-picker-clock"><span ng-if="!points || points.length < 1">&nbsp;</span>'
//        + '<div ng-repeat="point in points" class="dtp-picker-time" ng-style="point.style">'
//        + '   <a href="#" mdc-dtp-noclick ng-class="{selected: point.value===currentValue}" class="dtp-select-hour" ng-click="setTime(point.value)" ng-if="pointAvailable(point)">{{point.display}}</a>'
//        + '   <a href="#" mdc-dtp-noclick class="disabled dtp-select-hour" ng-if="!pointAvailable(point)">{{point.display}}</a>'
//        + '</div>'
//        + '<div class="dtp-hand dtp-hour-hand"></div>'
//        + '<div class="dtp-hand dtp-minute-hand"></div>'
//        + '<div class="dtp-clock-center"></div>'
//        + '</div>';

//      return {
//        restrict: 'E',
//        template: template,
//        link: function (scope, element, attrs) {
//          var minuteMode = attrs.mode === 'minutes';
//          var picker = scope.picker;
//          //banking on the fact that there will only be one at a time
//          var componentRoot = document.querySelector('md-dialog.dtp');
//          var exec = function () {
//            var clock = angular.element(element[0].querySelector('.dtp-picker-clock')),
//              pickerEl = angular.element(componentRoot.querySelector('.dtp-picker'));

//            var w = componentRoot.querySelector('.dtp-content').offsetWidth;
//            var pl = parseInt(css(pickerEl, 'paddingLeft').replace('px', '')) || 0;
//            var pr = parseInt(css(pickerEl, 'paddingRight').replace('px', '')) || 0;
//            var ml = parseInt(css(clock, 'marginLeft').replace('px', '')) || 0;
//            var mr = parseInt(css(clock, 'marginRight').replace('px', '')) || 0;
//            //set width
//            var clockWidth = (w - (ml + mr + pl + pr));
//            clock.css('width', (clockWidth) + 'px');

//            var pL = parseInt(css(pickerEl, 'paddingLeft').replace('px', '')) || 0;
//            var pT = parseInt(css(pickerEl, 'paddingTop').replace('px', '')) || 0;
//            var mL = parseInt(css(clock, 'marginLeft').replace('px', '')) || 0;
//            var mT = parseInt(css(clock, 'marginTop').replace('px', '')) || 0;

//            var r = (clockWidth / 2);
//            var j = r / 1.2; //???

//            var points = [];

//            for (var h = 0; h < 12; ++h) {
//              var x = j * Math.sin(Math.PI * 2 * (h / 12));
//              var y = j * Math.cos(Math.PI * 2 * (h / 12));
//              var left = (r + x + pL / 2) - (pL + mL);
//              var top = (r - y - mT / 2) - (pT + mT);

//              var hour = {
//                value: (minuteMode ? (h * 5) : h), //5 for minute 60/12
//                style: { 'margin-left': left + 'px', 'margin-top': top + 'px' }
//              };

//              if (minuteMode) {
//                hour.display = hour.value < 10 ? ('0' + hour.value) : hour.value;
//              } else {

//                if (picker.params.shortTime) {
//                  hour.display = (h === 0) ? 12 : h;
//                } else {
//                  hour.display = picker.isPM() ? h + 12 : h;
//                }
//              }


//              points.push(hour);
//            }

//            scope.points = points;
//            setCurrentValue();
//            clock.css('height', clockWidth + 'px');
//            //picker.initHands(true);

//            var clockCenter = element[0].querySelector('.dtp-clock-center');
//            var centerWidth = (clockCenter.offsetWidth / 2) || 7.5,
//              centerHeight = (clockCenter.offsetHeight / 2) || 7.5;
//            var _hL = r / 1.8;
//            var _mL = r / 1.5;

//            angular.element(element[0].querySelector('.dtp-hour-hand')).css({
//              left: r + (mL * 1.5) + 'px',
//              height: _hL + 'px',
//              marginTop: (r - _hL - pL) + 'px'
//            }).addClass(!minuteMode ? 'on' : '');

//            angular.element(element[0].querySelector('.dtp-minute-hand')).css
//              ({
//                left: r + (mL * 1.5) + 'px',
//                height: _mL + 'px',
//                marginTop: (r - _mL - pL) + 'px'
//              }).addClass(minuteMode ? 'on' : '');

//            angular.element(clockCenter).css({
//              left: (r + pL + mL - centerWidth) + 'px',
//              marginTop: (r - (mL / 2)) - centerHeight + 'px'
//            });
//            animateHands();
//          };

//          var animateHands = function () {
//            var _date = picker.currentNearest5Minute();
//            var h = _date.hour();
//            var m = _date.minute();

//            rotateElement(angular.element(element[0].querySelector('.dtp-hour-hand')), (360 / 12) * h);
//            var mdg = ((360 / 60) * (5 * Math.round(m / 5)));
//            rotateElement(angular.element(element[0].querySelector('.dtp-minute-hand')), mdg);
//          };

//          var rotateElement = function (el, deg) {
//            angular.element(el).css({
//              WebkitTransform: 'rotate(' + deg + 'deg)',
//              '-moz-transform': 'rotate(' + deg + 'deg)',
//              '-ms-transform': 'rotate(' + deg + 'deg)',
//              'transform': 'rotate(' + deg + 'deg)'
//            });
//          };


//          var setCurrentValue = function () {
//            var date = picker.currentNearest5Minute();
//            scope.currentValue = minuteMode ? date.minute() : (date.hour() % 12);
//          };

//          scope.$watch(function () {
//            var tmp = picker.currentNearest5Minute();
//            return tmp ? tmp.format('HH:mm') : '';
//          }, function (newVal) {
//            setCurrentValue();
//            animateHands();
//          });


//          var setDisplayPoints = function (isPM, points) {
//            for (var i = 0; i < points.length; i++) {
//              points[i].display = i;
//              if (isPM) {
//                points[i].display += 12;
//              }
//            }
//            return points;
//          };

//          if (!picker.params.shortTime) {
//            scope.$watch('picker.meridien', function () {
//              if (!minuteMode) {
//                if (scope.points) {
//                  var points = setDisplayPoints(picker.isPM(), angular.copy(scope.points));
//                  scope.points = points;
//                }
//              }
//            });
//          }


//          scope.setTime = function (val) {
//            if (val === scope.currentValue) {
//              picker.ok();
//            }

//            if (!minuteMode) {
//              picker.currentDate.hour(picker.isPM() ? (val + 12) : val);
//            } else {
//              picker.currentDate.minute(val);
//            }
//            picker.currentDate.second(0)
//          };

//          scope.pointAvailable = function (point) {
//            return minuteMode ? picker.isMinuteAvailable(point.value) : picker.isHourAvailable(point.value);
//          };

//          var unWatcher = scope.$watch(function () {
//            return element[0].querySelectorAll('div').length;
//          }, function () {
//            exec();
//            unWatcher();
//          });
//        }
//      }
//    }]);