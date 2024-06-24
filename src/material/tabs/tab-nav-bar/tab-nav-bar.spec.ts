import {Direction, Directionality} from '@angular/cdk/bidi';
import {ENTER, SPACE} from '@angular/cdk/keycodes';
import {SharedResizeObserver} from '@angular/cdk/observers/private';
import {
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
} from '@angular/cdk/testing/private';
import {Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, tick, waitForAsync} from '@angular/core/testing';
import {MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Subject} from 'rxjs';
import {MAT_TABS_CONFIG} from '../index';
import {MatTabsModule} from '../module';
import {MatTabLink, MatTabNav} from './tab-nav-bar';

describe('MDC-based MatTabNavBar', () => {
  let dir: Direction = 'ltr';
  let dirChange = new Subject();
  let globalRippleOptions: RippleGlobalOptions;
  let resizeEvents: Subject<ResizeObserverEntry[]>;

  beforeEach(waitForAsync(() => {
    globalRippleOptions = {};

    TestBed.configureTestingModule({
      imports: [
        MatTabsModule,
        SimpleTabNavBarTestApp,
        TabLinkWithNgIf,
        TabBarWithInactiveTabsOnInit,
      ],
      providers: [
        {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useFactory: () => globalRippleOptions},
        {provide: Directionality, useFactory: () => ({value: dir, change: dirChange})},
      ],
    });

    TestBed.compileComponents();

    resizeEvents = new Subject();
    spyOn(TestBed.inject(SharedResizeObserver), 'observe').and.returnValue(resizeEvents);
  }));

  describe('basic behavior', () => {
    let fixture: ComponentFixture<SimpleTabNavBarTestApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
      fixture.detectChanges();
    });

    it('should change active index on click', () => {
      // select the second link
      let tabLink = fixture.debugElement.queryAll(By.css('a'))[1];
      tabLink.nativeElement.click();
      expect(fixture.componentInstance.activeIndex).toBe(1);

      // select the third link
      tabLink = fixture.debugElement.queryAll(By.css('a'))[2];
      tabLink.nativeElement.click();
      expect(fixture.componentInstance.activeIndex).toBe(2);
    });

    it('should add the active class if active', () => {
      let tabLink1 = fixture.debugElement.queryAll(By.css('a'))[0];
      let tabLink2 = fixture.debugElement.queryAll(By.css('a'))[1];
      const tabLinkElements = fixture.debugElement
        .queryAll(By.css('a'))
        .map(tabLinkDebugEl => tabLinkDebugEl.nativeElement);

      tabLink1.nativeElement.click();
      fixture.detectChanges();
      expect(tabLinkElements[0].classList.contains('mdc-tab--active')).toBeTruthy();
      expect(tabLinkElements[1].classList.contains('mdc-tab--active')).toBeFalsy();

      tabLink2.nativeElement.click();
      fixture.detectChanges();
      expect(tabLinkElements[0].classList.contains('mdc-tab--active')).toBeFalsy();
      expect(tabLinkElements[1].classList.contains('mdc-tab--active')).toBeTruthy();
    });

    it('should update aria-disabled if disabled', () => {
      const tabLinkElements = fixture.debugElement
        .queryAll(By.css('a'))
        .map(tabLinkDebugEl => tabLinkDebugEl.nativeElement);

      expect(tabLinkElements.every(tabLink => tabLink.getAttribute('aria-disabled') === 'false'))
        .withContext('Expected aria-disabled to be set to "false" by default.')
        .toBe(true);

      fixture.componentInstance.disabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(tabLinkElements.every(tabLink => tabLink.getAttribute('aria-disabled') === 'true'))
        .withContext('Expected aria-disabled to be set to "true" if link is disabled.')
        .toBe(true);
    });

    it('should update the tabindex if links are disabled', () => {
      const tabLinkElements = fixture.debugElement
        .queryAll(By.css('a'))
        .map(tabLinkDebugEl => tabLinkDebugEl.nativeElement);

      expect(tabLinkElements.map(tabLink => tabLink.tabIndex))
        .withContext('Expected first element to be keyboard focusable by default')
        .toEqual([0, -1, -1]);

      fixture.componentInstance.disabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(tabLinkElements.every(tabLink => tabLink.tabIndex === -1))
        .withContext('Expected element to no longer be keyboard focusable if disabled.')
        .toBe(true);
    });

    it('should mark disabled links', () => {
      const tabLinkElement = fixture.debugElement.query(By.css('a')).nativeElement;

      expect(tabLinkElement.classList).not.toContain('mat-mdc-tab-disabled');

      fixture.componentInstance.disabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(tabLinkElement.classList).toContain('mat-mdc-tab-disabled');
    });

    it('should prevent default keyboard actions on disabled links', () => {
      const link = fixture.debugElement.query(By.css('a')).nativeElement;
      fixture.componentInstance.disabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      const spaceEvent = dispatchKeyboardEvent(link, 'keydown', SPACE);
      fixture.detectChanges();
      expect(spaceEvent.defaultPrevented).toBe(true);

      const enterEvent = dispatchKeyboardEvent(link, 'keydown', ENTER);
      fixture.detectChanges();
      expect(enterEvent.defaultPrevented).toBe(true);
    });

    it('should re-align the ink bar when the direction changes', fakeAsync(() => {
      const inkBar = fixture.componentInstance.tabNavBar._inkBar;

      spyOn(inkBar, 'alignToElement');

      dirChange.next();
      tick();
      fixture.detectChanges();

      expect(inkBar.alignToElement).toHaveBeenCalled();
    }));

    it('should re-align the ink bar when the tabs list change', fakeAsync(() => {
      const inkBar = fixture.componentInstance.tabNavBar._inkBar;

      spyOn(inkBar, 'alignToElement');

      fixture.componentInstance.tabs = [1, 2, 3, 4];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      tick();

      expect(inkBar.alignToElement).toHaveBeenCalled();
    }));

    it('should re-align the ink bar when the tab labels change the width', done => {
      const inkBar = fixture.componentInstance.tabNavBar._inkBar;

      const spy = spyOn(inkBar, 'alignToElement').and.callFake(() => {
        expect(spy.calls.any()).toBe(true);
        done();
      });

      fixture.componentInstance.label = 'label change';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(spy.calls.any()).toBe(false);
    });

    it('should re-align the ink bar when the nav bar is resized', fakeAsync(() => {
      const inkBar = fixture.componentInstance.tabNavBar._inkBar;

      spyOn(inkBar, 'alignToElement');

      resizeEvents.next([]);
      fixture.detectChanges();
      tick(32);

      expect(inkBar.alignToElement).toHaveBeenCalled();
    }));

    it('should hide the ink bar when all the links are inactive', () => {
      const inkBar = fixture.componentInstance.tabNavBar._inkBar;

      spyOn(inkBar, 'hide');

      fixture.componentInstance.tabLinks.forEach(link => (link.active = false));
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(inkBar.hide).toHaveBeenCalled();
    });

    it('should update the focusIndex when a tab receives focus directly', () => {
      const thirdLink = fixture.debugElement.queryAll(By.css('a'))[2];
      dispatchFakeEvent(thirdLink.nativeElement, 'focus');
      fixture.detectChanges();

      expect(fixture.componentInstance.tabNavBar.focusIndex).toBe(2);
    });
  });

  it('should hide the ink bar if no tabs are active on init', fakeAsync(() => {
    const fixture = TestBed.createComponent(TabBarWithInactiveTabsOnInit);
    fixture.detectChanges();
    tick(20); // Angular turns rAF calls into 16.6ms timeouts in tests.
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.mdc-tab-indicator--active').length).toBe(0);
  }));

  it('should clean up the ripple event handlers on destroy', () => {
    let fixture: ComponentFixture<TabLinkWithNgIf> = TestBed.createComponent(TabLinkWithNgIf);
    fixture.detectChanges();

    let link = fixture.debugElement.nativeElement.querySelector('.mat-mdc-tab-link');

    fixture.componentInstance.isDestroyed = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    dispatchMouseEvent(link, 'mousedown');

    expect(link.querySelector('.mat-ripple-element'))
      .withContext('Expected no ripple to be created when ripple target is destroyed.')
      .toBeFalsy();
  });

  it('should select the proper tab, if the tabs come in after init', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    const instance = fixture.componentInstance;

    instance.tabs = [];
    instance.activeIndex = 1;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(instance.tabNavBar.selectedIndex).toBe(-1);

    instance.tabs = [0, 1, 2];
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(instance.tabNavBar.selectedIndex).toBe(1);
  });

  it('should have the proper roles', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabBar = fixture.nativeElement.querySelector('.mat-mdc-tab-nav-bar')!;
    expect(tabBar.getAttribute('role')).toBe('tablist');

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-mdc-tab-link');

    expect(tabLinks[0].getAttribute('role')).toBe('tab');
    expect(tabLinks[1].getAttribute('role')).toBe('tab');
    expect(tabLinks[2].getAttribute('role')).toBe('tab');

    const tabPanel = fixture.nativeElement.querySelector('.mat-mdc-tab-nav-panel')!;
    expect(tabPanel.getAttribute('role')).toBe('tabpanel');
  });

  it('should manage tabindex properly', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-mdc-tab-link');
    expect(tabLinks[0].tabIndex).toBe(0);
    expect(tabLinks[1].tabIndex).toBe(-1);
    expect(tabLinks[2].tabIndex).toBe(-1);

    tabLinks[1].click();
    fixture.detectChanges();

    expect(tabLinks[0].tabIndex).toBe(-1);
    expect(tabLinks[1].tabIndex).toBe(0);
    expect(tabLinks[2].tabIndex).toBe(-1);
  });

  it('should setup aria-controls properly', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-mdc-tab-link');
    expect(tabLinks[0].getAttribute('aria-controls')).toBe('tab-panel');
    expect(tabLinks[1].getAttribute('aria-controls')).toBe('tab-panel');
    expect(tabLinks[2].getAttribute('aria-controls')).toBe('tab-panel');
  });

  it('should not manage aria-current', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-mdc-tab-link');
    expect(tabLinks[0].getAttribute('aria-current')).toBe(null);
    expect(tabLinks[1].getAttribute('aria-current')).toBe(null);
    expect(tabLinks[2].getAttribute('aria-current')).toBe(null);
  });

  it('should manage aria-selected properly', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-mdc-tab-link');
    expect(tabLinks[0].getAttribute('aria-selected')).toBe('true');
    expect(tabLinks[1].getAttribute('aria-selected')).toBe('false');
    expect(tabLinks[2].getAttribute('aria-selected')).toBe('false');

    tabLinks[1].click();
    fixture.detectChanges();

    expect(tabLinks[0].getAttribute('aria-selected')).toBe('false');
    expect(tabLinks[1].getAttribute('aria-selected')).toBe('true');
    expect(tabLinks[2].getAttribute('aria-selected')).toBe('false');
  });

  it('should activate a link when space is pressed', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-mdc-tab-link');
    expect(tabLinks[1].classList.contains('mdc-tab--active')).toBe(false);

    dispatchKeyboardEvent(tabLinks[1], 'keydown', SPACE);
    fixture.detectChanges();

    expect(tabLinks[1].classList.contains('mdc-tab--active')).toBe(true);
  });

  it('should activate a link when enter is pressed', () => {
    const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
    fixture.detectChanges();

    const tabLinks = fixture.nativeElement.querySelectorAll('.mat-mdc-tab-link');
    expect(tabLinks[1].classList.contains('mdc-tab--active')).toBe(false);

    dispatchKeyboardEvent(tabLinks[1], 'keydown', ENTER);
    fixture.detectChanges();

    expect(tabLinks[1].classList.contains('mdc-tab--active')).toBe(true);
  });

  describe('ripples', () => {
    let fixture: ComponentFixture<SimpleTabNavBarTestApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
      fixture.detectChanges();
    });

    it('should be disabled on all tab links when they are disabled on the nav bar', () => {
      expect(fixture.componentInstance.tabLinks.toArray().every(tabLink => !tabLink.rippleDisabled))
        .withContext('Expected every tab link to have ripples enabled')
        .toBe(true);

      fixture.componentInstance.disableRippleOnBar = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(fixture.componentInstance.tabLinks.toArray().every(tabLink => tabLink.rippleDisabled))
        .withContext('Expected every tab link to have ripples disabled')
        .toBe(true);
    });

    it('should have the `disableRipple` from the tab take precedence over the nav bar', () => {
      const firstTab = fixture.componentInstance.tabLinks.first;

      expect(firstTab.rippleDisabled)
        .withContext('Expected ripples to be enabled on first tab')
        .toBe(false);

      firstTab.disableRipple = true;
      fixture.componentInstance.disableRippleOnBar = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(firstTab.rippleDisabled)
        .withContext('Expected ripples to be disabled on first tab')
        .toBe(true);
    });

    it('should show up for tab link elements on mousedown', () => {
      const tabLink = fixture.debugElement.nativeElement.querySelector('.mat-mdc-tab-link');

      dispatchMouseEvent(tabLink, 'mousedown');
      dispatchMouseEvent(tabLink, 'mouseup');

      expect(tabLink.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected one ripple to show up if user clicks on tab link.')
        .toBe(1);
    });

    it('should be able to disable ripples on an individual tab link', () => {
      const tabLinkDebug = fixture.debugElement.query(By.css('a'));
      const tabLinkElement = tabLinkDebug.nativeElement;

      fixture.componentInstance.disableRippleOnLink = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      dispatchMouseEvent(tabLinkElement, 'mousedown');
      dispatchMouseEvent(tabLinkElement, 'mouseup');

      expect(tabLinkElement.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected no ripple to show up if ripples are disabled.')
        .toBe(0);
    });

    it('should be able to disable ripples through global options at runtime', () => {
      expect(fixture.componentInstance.tabLinks.toArray().every(tabLink => !tabLink.rippleDisabled))
        .withContext('Expected every tab link to have ripples enabled')
        .toBe(true);

      globalRippleOptions.disabled = true;

      expect(fixture.componentInstance.tabLinks.toArray().every(tabLink => tabLink.rippleDisabled))
        .withContext('Expected every tab link to have ripples disabled')
        .toBe(true);
    });

    it('should have a focus indicator', () => {
      const tabLinkNativeElements = [
        ...fixture.debugElement.nativeElement.querySelectorAll('.mat-mdc-tab-link'),
      ];

      expect(
        tabLinkNativeElements.every(element =>
          element.classList.contains('mat-mdc-focus-indicator'),
        ),
      ).toBe(true);
    });
  });

  describe('with the ink bar fit to content', () => {
    let fixture: ComponentFixture<SimpleTabNavBarTestApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
      fixture.componentInstance.fitInkBarToContent = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
    });

    it('should properly nest the ink bar when fit to content', () => {
      const tabElement = fixture.nativeElement.querySelector('.mdc-tab');
      const contentElement = tabElement.querySelector('.mdc-tab__content');
      const indicatorElement = tabElement.querySelector('.mdc-tab-indicator');
      expect(indicatorElement.parentElement).toBeTruthy();
      expect(indicatorElement.parentElement).toBe(contentElement);
    });

    it('should be able to move the ink bar between content and full', () => {
      fixture.componentInstance.fitInkBarToContent = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      const tabElement = fixture.nativeElement.querySelector('.mdc-tab');
      const indicatorElement = tabElement.querySelector('.mdc-tab-indicator');
      expect(indicatorElement.parentElement).toBeTruthy();
      expect(indicatorElement.parentElement).toBe(tabElement);

      fixture.componentInstance.fitInkBarToContent = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      const contentElement = tabElement.querySelector('.mdc-tab__content');
      expect(indicatorElement.parentElement).toBeTruthy();
      expect(indicatorElement.parentElement).toBe(contentElement);
    });
  });
});

describe('MatTabNavBar with a default config', () => {
  let fixture: ComponentFixture<TabLinkWithNgIf>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatTabsModule, BrowserAnimationsModule, TabLinkWithNgIf],
      providers: [{provide: MAT_TABS_CONFIG, useValue: {fitInkBarToContent: true}}],
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabLinkWithNgIf);
    fixture.detectChanges();
  });

  it('should set whether the ink bar fits to content', () => {
    const tabElement = fixture.nativeElement.querySelector('.mdc-tab');
    const contentElement = tabElement.querySelector('.mdc-tab__content');
    const indicatorElement = tabElement.querySelector('.mdc-tab-indicator');
    expect(indicatorElement.parentElement).toBeTruthy();
    expect(indicatorElement.parentElement).toBe(contentElement);
  });
});

describe('MatTabNavBar with enabled animations', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatTabsModule, BrowserAnimationsModule, TabsWithCustomAnimationDuration],
    });

    TestBed.compileComponents();
  }));

  it('should not throw when setting an animationDuration without units', fakeAsync(() => {
    expect(() => {
      let fixture = TestBed.createComponent(TabsWithCustomAnimationDuration);
      fixture.detectChanges();
      tick();
    }).not.toThrow();
  }));

  it('should set appropiate css variable given a specified animationDuration', fakeAsync(() => {
    let fixture = TestBed.createComponent(TabsWithCustomAnimationDuration);
    fixture.detectChanges();
    tick();

    const tabNavBar = fixture.nativeElement.querySelector('.mat-mdc-tab-nav-bar');
    expect(tabNavBar.style.getPropertyValue('--mat-tab-animation-duration')).toBe('500ms');
  }));
});

@Component({
  selector: 'test-app',
  template: `
    <nav mat-tab-nav-bar
         [disableRipple]="disableRippleOnBar"
         [fitInkBarToContent]="fitInkBarToContent"
         [tabPanel]="tabPanel">
      @for (tab of tabs; track tab; let index = $index) {
        <a mat-tab-link
          [active]="activeIndex === index"
          [disabled]="disabled"
          (click)="activeIndex = index"
          [disableRipple]="disableRippleOnLink">Tab link {{label}}</a>
      }
    </nav>
    <mat-tab-nav-panel #tabPanel id="tab-panel">Tab panel</mat-tab-nav-panel>
  `,
  standalone: true,
  imports: [MatTabsModule],
})
class SimpleTabNavBarTestApp {
  @ViewChild(MatTabNav) tabNavBar: MatTabNav;
  @ViewChildren(MatTabLink) tabLinks: QueryList<MatTabLink>;

  label = '';
  disabled = false;
  disableRippleOnBar = false;
  disableRippleOnLink = false;
  tabs = [0, 1, 2];
  fitInkBarToContent = false;

  activeIndex = 0;
}

@Component({
  template: `
    <nav mat-tab-nav-bar [tabPanel]="tabPanel">
      @if (!isDestroyed) {
        <a mat-tab-link>Link</a>
      }
    </nav>
    <mat-tab-nav-panel #tabPanel>Tab panel</mat-tab-nav-panel>
  `,
  standalone: true,
  imports: [MatTabsModule],
})
class TabLinkWithNgIf {
  isDestroyed = false;
}

@Component({
  template: `
    <nav mat-tab-nav-bar [tabPanel]="tabPanel">
      @for (tab of tabs; track tab) {
        <a mat-tab-link [active]="false">Tab link {{label}}</a>
      }
    </nav>
    <mat-tab-nav-panel #tabPanel>Tab panel</mat-tab-nav-panel>
  `,
  standalone: true,
  imports: [MatTabsModule],
})
class TabBarWithInactiveTabsOnInit {
  tabs = [0, 1, 2];
}

@Component({
  template: `
    <nav [animationDuration]="500" mat-tab-nav-bar [tabPanel]="tabPanel">
    @for (link of links; track link) {
      <a mat-tab-link>{{link}}</a>
    }
  </nav>
  <mat-tab-nav-panel #tabPanel></mat-tab-nav-panel>,
  `,
  standalone: true,
  imports: [MatTabsModule],
})
class TabsWithCustomAnimationDuration {
  links = ['First', 'Second', 'Third'];
}
