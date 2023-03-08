import {Component, NgModule, NgZone} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {NavigationFocusService} from './navigation-focus.service';
import {NavigationFocusModule} from './navigation-focus';

describe('Navigation focus service', () => {
  let navigationFocusService: NavigationFocusService;
  let router: Router;
  let zone: NgZone;
  let fixture: ComponentFixture<NavigationFocusTest>;

  const navigate = (url: string) => {
    zone.run(() => router.navigateByUrl(url));
    tick(100);
  };

  beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes([
          {path: '', component: RouteTest},
          {path: 'cdk', component: RouteTest},
          {path: 'guides', component: RouteTest}
        ]),
        NavigationFocusModule],
        providers: [NavigationFocusService],
        declarations: [NavigationFocusTest, RouteTest],
      });
      fixture = TestBed.createComponent(NavigationFocusTest);
    }
  );

  beforeEach(() => {
    zone = TestBed.inject(NgZone);
    router = TestBed.inject(Router);
    navigationFocusService = TestBed.inject(NavigationFocusService);
  });

  it('should set skip link href', () => {
    const target1 = fixture.nativeElement.querySelector('#target1');
    const target2 = fixture.nativeElement.querySelector('#target2');

    navigationFocusService.requestSkipLinkFocus(target1);
    navigationFocusService.requestSkipLinkFocus(target2);

    expect(navigationFocusService.getSkipLinkHref()).toEqual('/#target2');

    navigationFocusService.relinquishSkipLinkFocus(target2);

    expect(navigationFocusService.getSkipLinkHref()).toEqual('/#target1');
  });

  it('should set skip link href to null when there are no more requests', () => {
    const target1 = fixture.nativeElement.querySelector('#target1');
    const target3 = fixture.nativeElement.querySelector('.no-id');

    navigationFocusService.requestSkipLinkFocus(target1);
    expect(navigationFocusService.getSkipLinkHref()).toEqual('/#target1');

    navigationFocusService.relinquishSkipLinkFocus(target1);
    // target3 has `focusOnNavigation` directive that automatically requests focus, so focus must
    // be relinquished to test the desired behaviour
    navigationFocusService.relinquishSkipLinkFocus(target3);
    expect(navigationFocusService.getSkipLinkHref()).toBeNull();
  });

  it('should set id for skip link target without id', () => {
    const skipLinkTarget = fixture.nativeElement.querySelector('.no-id');

    navigationFocusService.requestSkipLinkFocus(skipLinkTarget);

    expect(navigationFocusService.getSkipLinkHref()).toMatch(`/#skip-link-target-[0-9]*`);
  });

  it('should be within component view', () => {
    const previousUrl = '/components/autocomplete/overview';
    const newUrl = '/components/autocomplete/overview#simple-autocomplete';
    expect(navigationFocusService.isNavigationWithinComponentView(previousUrl, newUrl)).toBeTrue();
  });

  it('should not be within component view', () => {
    const previousUrl = '/cdk/clipboard/overview';
    const newUrl = '/cdk/categories';
    expect(navigationFocusService.isNavigationWithinComponentView(previousUrl, newUrl)).toBeFalse();
  });

  it('should focus on component then relinquish focus', fakeAsync(() => {
    const target1 = fixture.nativeElement.querySelector('#target1');
    const target2 = fixture.nativeElement.querySelector('#target2');

    // First navigation event doesn't trigger focus because it represents a hardnav.
    navigationFocusService.requestFocusOnNavigation(target1);
    navigationFocusService.requestFocusOnNavigation(target2);
    navigate('/');
    expect(document.activeElement).not.toEqual(target1);
    expect(document.activeElement).not.toEqual(target2);

    // Most recent requester gets focus on the next nav.
    navigate('/guides');
    expect(document.activeElement).toEqual(target2);

    // Falls back to the focusing the previous requester once the most recent one relinquishes.
    navigationFocusService.relinquishFocusOnNavigation(target2);
    navigate('/cdk');
    expect(document.activeElement).toEqual(target1);
  }));

  it('should not set focus when navigating to hash target', fakeAsync(() => {
    const target1 = fixture.nativeElement.querySelector('#target1');

    // First navigation event doesn't trigger focus because it represents a hardnav.
    navigationFocusService.requestFocusOnNavigation(target1);
    navigate('/');
    expect(document.activeElement).not.toEqual(target1);

    // Navigating to a hash target should not set focus on target1 even though it requested focus
    navigate('/guides#hash');
    expect(document.activeElement).not.toEqual(target1);
  }));
});

@Component({
  selector: 'navigation-focus-test',
  template: `
    <button id="target1">Target 1</button>
    <button id="target2">Target 2</button>
    <button class="no-id" focusOnNavigation>Target 3</button>
  `
})
class NavigationFocusTest {
}
@NgModule({
  imports: [NavigationFocusModule]
})

@Component({
  selector: 'route-test',
  template: '',
})
class RouteTest {
}
