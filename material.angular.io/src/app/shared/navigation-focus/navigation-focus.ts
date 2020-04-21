import {NgModule, Directive, ElementRef, HostBinding, OnDestroy} from '@angular/core';
import {Event, Router, NavigationEnd} from '@angular/router';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';

/** The timeout id of the previous focus change. */
let lastTimeoutId = -1;

@Directive({
  selector: '[focusOnNavigation]',
})
export class NavigationFocus implements OnDestroy {
  @HostBinding('tabindex') role = '-1';

  private subscriptions = new Subscription();

  constructor(private el: ElementRef, private router: Router) {
    // We need to subscribe in the constructor in order to catch the `NavigationEnd` event
    // from navigating from the previous page to this page.
    this.subscriptions.add(
      this.router.events
        .pipe(
          filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe((navigationEnd: NavigationEnd) => {
          const currentLocation = new URL(window.location.href);
          if (!currentLocation.hash && isSoftNav(navigationEnd)) {
            clearTimeout(lastTimeoutId);
            lastTimeoutId =
              window.setTimeout(() => this.el.nativeElement.focus({preventScroll: true}), 100);
          }
        }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

function isSoftNav(navigationEnd: NavigationEnd) {
  // Each navigation has a unique id that is available on the RouterEvents. The id is a number that
  // is incremented. This currently works in all cases because there is only 1 redirect in the app
  // (`CanActivateComponentSidenav`) and it would not matter for that case. However it is worth
  // nothing that this implementation "could" break if more guards/redirects are added.
  return navigationEnd.id !== 1;
}

@NgModule({
  declarations: [NavigationFocus],
  exports: [NavigationFocus],
})
export class NavigationFocusModule {}
