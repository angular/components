import {ViewContainerRef} from '@angular/core';
import {AriaLivePoliteness} from '../core';


export class MdSnackBarConfig {
  /** The politeness level for the MdAriaLiveAnnouncer announcement. */
  politeness: AriaLivePoliteness = 'assertive';

  /** Message to be announced by the MdAriaLiveAnnouncer */
  announcementMessage: string;

  /** The view container to place the overlay for the snack bar into. */
  viewContainerRef: ViewContainerRef;

  /*
   * The number of milliseconds to wait before automatically dismissing.
   * If no value is specified the snackbar will dismiss normally.
   * If a value is provided the snackbar can still be dismissed normally.
   * If a snackbar is dismissed before the timer expires, the timer will be cleared.
   */
  autoHideDuration: number | boolean;

  constructor(viewContainerRef: ViewContainerRef, autoHideDuration: number | boolean = false) {
    this.viewContainerRef = viewContainerRef;
    this.autoHideDuration = autoHideDuration;
  }
}
