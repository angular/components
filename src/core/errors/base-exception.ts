
export class BaseException extends Error {
  public stack: any;
  constructor(public message: string = "--") {
    super(message);
    this.stack = (<any>new Error(message)).stack;
  }

  toString(): string { return this.message; }
}
