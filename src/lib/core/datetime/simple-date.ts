export class SimpleDate {
  static fromNativeDate(nativeDate: Date) {
    return new SimpleDate(nativeDate.getFullYear(), nativeDate.getMonth(), nativeDate.getDate());
  }

  constructor(public year: number, public month: number, public date: number) {}

  toNativeDate() {
    return new Date(this.year, this.month, this.date);
  }
}
