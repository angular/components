import {MdDateFormats} from './date-formats';


export const MD_NATIVE_DATE_FORMATS: MdDateFormats = {
  parse: {
    dateInput: null,
  },
  display: {
    dateInput: {year: 'numeric', month: 'numeric', day: 'numeric'},
    monthYearLabel: {year: 'numeric', month: 'short'},
  }
};
