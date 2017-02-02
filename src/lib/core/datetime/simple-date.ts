/**
 * A replacement for the native JS Date class that allows us to avoid dealing with time zone
 * details and the time component of the native Date.
 */
export class SimpleDate {
  static fromNativeDate(nativeDate: Date) {
    return new SimpleDate(nativeDate.getFullYear(), nativeDate.getMonth(), nativeDate.getDate());
  }

  constructor(public year: number, public month: number, public date: number) {}

  toNativeDate() {
    return new Date(this.year, this.month, this.date);
  }
}
