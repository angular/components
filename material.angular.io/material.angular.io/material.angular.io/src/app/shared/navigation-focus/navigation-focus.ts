import {Directive, ElementRef, HostBinding, OnDestroy} from '@angular/core';
import {NavigationFocusService} from './navigation-focus.service';

let uid = 0;
@Directive({
  selector: '[focusOnNavigation]',
  standalone: true,
})
export class NavigationFocus implements OnDestroy {
  @HostBinding('tabindex') readonly tabindex = '-1';
  @HostBinding('style.outline') readonly outline = 'none';

  constructor(private el: ElementRef, private navigationFocusService: NavigationFocusService) {
    if (!el.nativeElement.id) {
      el.nativeElement.id = `skip-link-target-${uid++}`;
    }
    this.navigationFocusService.requestFocusOnNavigation(el.nativeElement);
    this.navigationFocusService.requestSkipLinkFocus(el.nativeElement);
  }

  ngOnDestroy() {
    this.navigationFocusService.relinquishFocusOnNavigation(this.el.nativeElement);
    this.navigationFocusService.relinquishSkipLinkFocus(this.el.nativeElement);
  }
}

