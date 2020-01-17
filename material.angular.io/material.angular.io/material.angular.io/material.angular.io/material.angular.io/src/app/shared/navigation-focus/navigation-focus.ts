import {NgModule, OnInit, Directive, ElementRef, HostBinding} from '@angular/core';

/** The timeout id of the previous focus change. */
let lastTimeoutId = -1;

@Directive({
  selector: '[focusOnNavigation]',
})
export class NavigationFocus implements OnInit {
  @HostBinding('tabindex') role = '-1';

  constructor(private el: ElementRef) {}

  ngOnInit() {
    clearTimeout(lastTimeoutId);
    // 100ms timeout is used to allow the page to settle before moving focus for screen readers.
    lastTimeoutId = window.setTimeout(() => this.el.nativeElement.focus({preventScroll: true}),
      100);
  }
}

@NgModule({
  declarations: [NavigationFocus],
  exports: [NavigationFocus],
})
export class NavigationFocusModule {}
