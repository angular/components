////import {
////  Component,
////  Input,
////} from '@angular/core';

////@Component({
////  moduleId: module.id,
////  selector: 'md-calendar-month',
////  templateUrl: 'calendarMonth.html'
////})
////export class MdCalendarMonth {

////  @Input('model-format') modelFormat: string;

////  private test(): void {
////  }

////}

//import {Injectable} from '@angular/core';
//import {IMyLocales, IMyOptions} from './datepicker';

//@Injectable()
//export class LocaleService {
//  private locales: IMyLocales = {
//    'en': {
//      //dayLabels: { su: 'Sun', mo: 'Mon', tu: 'Tue', we: 'Wed', th: 'Thu', fr: 'Fri', sa: 'Sat' },
//      //monthLabels: { 1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec' },
//      //dateFormat: 'yyyy-mm-dd',
//      //sunHighlight: true,
//    }
//  };

//  getLocaleOptions(locale: string): IMyOptions {
//    if (locale && this.locales.hasOwnProperty(locale)) {
//      // User given locale
//      return this.locales[locale];
//    }
//    // Default: en
//    return this.locales['en'];
//  }
//}