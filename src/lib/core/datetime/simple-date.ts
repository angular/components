/**
 * A replacement for the native JS Date class that allows us to avoid dealing with time zone
 * details and the time component of the native Date.
 */
export class SimpleDate {
  /**
   * Create a SimpleDate from a native JS Date object.
   * @param nativeDate The native JS Date object to convert.
   */
  static fromNativeDate(nativeDate: Date): SimpleDate {
    return new SimpleDate(nativeDate.getFullYear(), nativeDate.getMonth(), nativeDate.getDate());
  }

  /** Creates a SimpleDate object representing today. */
  static today(): SimpleDate {
    return SimpleDate.fromNativeDate(new Date());
  }

  /** The native JS Date. */
  private _date: Date;

  constructor(year: number, month: number, date: number) {
    this._date = new Date(year, month, date);
    // We need to correct for the fact that JS native Date treats years in range [0, 99] as
    // abbreviations for 19xx.
    if (year >= 0 && year < 100) {
      this._date = new Date(this._date.setFullYear(this.year - 1900));
    }
  }

  /** The year component of this date. */
  get year(): number {
    return this._date.getFullYear();
  }

  /** The month component of this date. (0-indexed, 0 = January). */
  get month(): number {
    return this._date.getMonth();
  }

  /** The date component of this date. (1-indexed, 1 = 1st of month). */
  get date(): number {
    return this._date.getDate();
  }

  /** The day component of this date. (0-indexed, 0 = Sunday) */
  get day(): number {
    return this._date.getDay();
  }

  /**
   * Adds an amount of time (in days, months, and years) to the date.
   * @param amount The amount of time to add.
   */
  add(amount: {days: number, months: number, years: number}): SimpleDate {
    return new SimpleDate(
        this.year + amount.years || 0,
        this.month + amount.months || 0,
        this.date + amount.days || 0);
  }

  /** Converts the SimpleDate to a native JS Date object. */
  toNativeDate(): Date {
    return new Date(this.year, this.month, this.date);
  }
}
