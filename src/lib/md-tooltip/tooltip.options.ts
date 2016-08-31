import { Injectable } from '@angular/core';

@Injectable()
export class MdTooltipOptions {
  public direction: string;
  /**
   * constructor for tooltip options
   * @param options
   */
  public constructor(options: Object) {
    Object.assign(this, options);
  }
}
