import {MutationObserverFactory} from '../../observers';
import {ComponentPortal} from '../../portal';
import {Component, inject, Injector, ChangeDetectionStrategy} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By, DomSanitizer} from '@angular/platform-browser';
import {A11yModule} from '../index';
import {LiveAnnouncer, LiveAnnouncerMessage} from './live-announcer';
import {
  AriaLivePoliteness,
  LIVE_ANNOUNCER_DEFAULT_OPTIONS,
  LIVE_ANNOUNCER_ELEMENT_TOKEN,
  LiveAnnouncerDefaultOptions,
} from './live-announcer-tokens';
import {createOverlayRef} from '@angular/cdk/overlay';

describe('LiveAnnouncer', () => {
  let announcer: LiveAnnouncer;
  let ariaLiveElement: Element;
  let fixture: ComponentFixture<TestApp>;

  function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  describe('with default element', () => {
    beforeEach(async () => {
      announcer = TestBed.inject(LiveAnnouncer);
      ariaLiveElement = getLiveElement();
      fixture = TestBed.createComponent(TestApp);
    });

    it('should correctly update the announce text', async () => {
      let buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
      buttonElement.click();

      // This flushes our 100ms timeout for the screenreaders.
      await wait(110);

      expect(ariaLiveElement.textContent).toBe('Test');
    });

    it('should correctly update the politeness attribute', async () => {
      announcer.announce('Hey Google', 'assertive');

      // This flushes our 100ms timeout for the screenreaders.
      await wait(110);

      expect(ariaLiveElement.textContent).toBe('Hey Google');
      expect(ariaLiveElement.getAttribute('aria-live')).toBe('assertive');
    });

    it('should apply the aria-live value polite by default', async () => {
      announcer.announce('Hey Google');

      // This flushes our 100ms timeout for the screenreaders.
      await wait(110);

      expect(ariaLiveElement.textContent).toBe('Hey Google');
      expect(ariaLiveElement.getAttribute('aria-live')).toBe('polite');
    });

    it('should be able to clear out the aria-live element manually', async () => {
      announcer.announce('Hey Google');
      await wait(110);
      expect(ariaLiveElement.textContent).toBe('Hey Google');

      announcer.clear();
      expect(ariaLiveElement.textContent).toBeFalsy();
    });

    it('should be able to clear out the aria-live element by setting a duration', async () => {
      announcer.announce('Hey Google', 2000);
      await wait(110);
      expect(ariaLiveElement.textContent).toBe('Hey Google');

      await wait(2010);
      expect(ariaLiveElement.textContent).toBeFalsy();
    });

    it('should clear the duration of previous messages when announcing a new one', async () => {
      announcer.announce('Hey Google', 2000);
      await wait(100);
      expect(ariaLiveElement.textContent).toBe('Hey Google');

      announcer.announce('Hello there');
      await wait(2500);
      expect(ariaLiveElement.textContent).toBe('Hello there');
    });

    it('should remove the aria-live element from the DOM on destroy', async () => {
      announcer.announce('Hey Google');

      // This flushes our 100ms timeout for the screenreaders.
      await wait(100);

      // Call the lifecycle hook manually since Angular won't do it in tests.
      announcer.ngOnDestroy();

      expect(document.body.querySelector('.cdk-live-announcer-element'))
        .withContext('Expected that the aria-live element was remove from the DOM.')
        .toBeFalsy();
    });

    it('should return a promise that resolves after the text has been announced', async () => {
      const spy = jasmine.createSpy('announce spy');
      announcer.announce('something').then(spy);

      expect(spy).not.toHaveBeenCalled();
      await wait(110);
      expect(spy).toHaveBeenCalled();
    });

    it('should resolve the returned promise if another announcement is made before the timeout has expired', async () => {
      const spy = jasmine.createSpy('announce spy');
      announcer.announce('something').then(spy);
      await wait(10);
      announcer.announce('something').then(spy);
      await wait(110);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should ensure that there is only one live element at a time', async () => {
      fixture.destroy();
      TestBed.resetTestingModule().configureTestingModule({});

      const extraElement = document.createElement('div');
      extraElement.classList.add('cdk-live-announcer-element');
      document.body.appendChild(extraElement);
      announcer = TestBed.inject(LiveAnnouncer);
      ariaLiveElement = getLiveElement();
      fixture = TestBed.createComponent(TestApp);

      announcer.announce('Hey Google');
      await wait(110);

      expect(document.body.querySelectorAll('.cdk-live-announcer-element').length)
        .withContext('Expected only one live announcer element in the DOM.')
        .toBe(1);
      extraElement.remove();
    });

    it('should clear any previous timers when a new one is started', async () => {
      expect(ariaLiveElement.textContent).toBeFalsy();

      announcer.announce('One');
      await wait(50);

      announcer.announce('Two');
      await wait(75);

      expect(ariaLiveElement.textContent).toBeFalsy();

      await wait(100);

      expect(ariaLiveElement.textContent).toBe('Two');
    });

    it('should clear pending timeouts on destroy', async () => {
      announcer.announce('Hey Google');
      announcer.ngOnDestroy();

      // Since we're testing whether the timeouts were flushed, we don't need any
      // assertions here. `fakeAsync` will fail the test if a timer was left over.
    });

    it('should add aria-owns to open aria-modal elements', async () => {
      const portal = new ComponentPortal(TestModal);
      const overlayRef = createOverlayRef(TestBed.inject(Injector));
      const componentRef = overlayRef.attach(portal);
      const modal = componentRef.location.nativeElement;
      fixture.detectChanges();

      expect(ariaLiveElement.id).toBeTruthy();
      expect(modal.hasAttribute('aria-owns')).toBe(false);

      announcer.announce('Hey Google', 'assertive');
      await wait(110);
      expect(modal.getAttribute('aria-owns')).toBe(ariaLiveElement.id);

      // Verify that the ID isn't duplicated.
      announcer.announce('Hey Google again', 'assertive');
      await wait(110);
      expect(modal.getAttribute('aria-owns')).toBe(ariaLiveElement.id);
    });

    it('should expand aria-owns of open aria-modal elements', async () => {
      const portal = new ComponentPortal(TestModal);
      const overlayRef = createOverlayRef(TestBed.inject(Injector));
      const componentRef = overlayRef.attach(portal);
      const modal = componentRef.location.nativeElement;
      fixture.detectChanges();

      componentRef.instance.ariaOwns = 'foo bar';
      componentRef.changeDetectorRef.detectChanges();

      expect(ariaLiveElement.id).toBeTruthy();
      expect(modal.getAttribute('aria-owns')).toBe('foo bar');

      announcer.announce('Hey Google', 'assertive');
      await wait(110);
      expect(modal.getAttribute('aria-owns')).toBe(`foo bar ${ariaLiveElement.id}`);

      // Verify that the ID isn't duplicated.
      announcer.announce('Hey Google again', 'assertive');
      await wait(110);
      expect(modal.getAttribute('aria-owns')).toBe(`foo bar ${ariaLiveElement.id}`);
    });

    it('should be able to announce safe HTML', async () => {
      const sanitizer = TestBed.inject(DomSanitizer);
      const message = sanitizer.bypassSecurityTrustHtml(
        '<span class="message" lang="fr">Bonjour</span>',
      );
      fixture.componentInstance.announce(message);

      // This flushes our 100ms timeout for the screenreaders.
      await wait(110);

      expect(ariaLiveElement.querySelector('.message')?.textContent).toBe('Bonjour');
    });
  });

  describe('with a custom element', () => {
    let customLiveElement: HTMLElement;

    beforeEach(() => {
      customLiveElement = document.createElement('div');

      return TestBed.configureTestingModule({
        providers: [{provide: LIVE_ANNOUNCER_ELEMENT_TOKEN, useValue: customLiveElement}],
      });
    });

    beforeEach(() => {
      announcer = TestBed.inject(LiveAnnouncer);
      ariaLiveElement = getLiveElement();
    });

    it('should allow to use a custom live element', async () => {
      announcer.announce('Custom Element');

      // This flushes our 100ms timeout for the screenreaders.
      await wait(110);

      expect(customLiveElement.textContent).toBe('Custom Element');
    });
  });

  describe('with a default options', () => {
    beforeEach(() => {
      return TestBed.configureTestingModule({
        providers: [
          {
            provide: LIVE_ANNOUNCER_DEFAULT_OPTIONS,
            useValue: {
              politeness: 'assertive',
              duration: 1337,
            } as LiveAnnouncerDefaultOptions,
          },
        ],
      });
    });

    beforeEach(() => {
      announcer = TestBed.inject(LiveAnnouncer);
      ariaLiveElement = getLiveElement();
    });

    it('should pick up the default politeness from the injection token', async () => {
      announcer.announce('Hello');

      await wait(2000);

      expect(ariaLiveElement.getAttribute('aria-live')).toBe('assertive');
    });

    it('should pick up the default duration from the injection token', async () => {
      announcer.announce('Hello');

      await wait(110);
      expect(ariaLiveElement.textContent).toBe('Hello');

      await wait(1500);
      expect(ariaLiveElement.textContent).toBeFalsy();
    });
  });
});

describe('CdkAriaLive', () => {
  let mutationCallbacks: Function[] = [];
  let announcer: LiveAnnouncer;
  let announcerSpy: jasmine.Spy;
  let fixture: ComponentFixture<DivWithCdkAriaLive>;

  const invokeMutationCallbacks = () => mutationCallbacks.forEach(cb => cb([{type: 'fake'}]));

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MutationObserverFactory,
          useValue: {
            create: (callback: Function) => {
              mutationCallbacks.push(callback);
              return {
                observe: () => {},
                disconnect: () => {},
              };
            },
          },
        },
      ],
    });
  });

  beforeEach(async () => {
    announcer = TestBed.inject(LiveAnnouncer);
    announcerSpy = spyOn(announcer, 'announce').and.callThrough();
    fixture = TestBed.createComponent(DivWithCdkAriaLive);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should default politeness to polite', async () => {
    fixture.componentInstance.content = 'New content';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    invokeMutationCallbacks();
    await fixture.whenStable();

    expect(announcer.announce).toHaveBeenCalledWith('New content', 'polite', undefined);
  });

  it('should dynamically update the politeness', async () => {
    fixture.componentInstance.content = 'New content';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    invokeMutationCallbacks();
    await fixture.whenStable();

    expect(announcer.announce).toHaveBeenCalledWith('New content', 'polite', undefined);

    announcerSpy.calls.reset();
    fixture.componentInstance.politeness = 'off';
    fixture.componentInstance.content = 'Newer content';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    invokeMutationCallbacks();
    await fixture.whenStable();

    expect(announcer.announce).not.toHaveBeenCalled();

    announcerSpy.calls.reset();
    fixture.componentInstance.politeness = 'assertive';
    fixture.componentInstance.content = 'Newest content';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    invokeMutationCallbacks();
    await fixture.whenStable();

    expect(announcer.announce).toHaveBeenCalledWith('Newest content', 'assertive', undefined);
  });

  it('should not announce the same text multiple times', async () => {
    fixture.componentInstance.content = 'Content';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    invokeMutationCallbacks();
    await fixture.whenStable();

    expect(announcer.announce).toHaveBeenCalledTimes(1);

    fixture.detectChanges();
    invokeMutationCallbacks();
    await fixture.whenStable();

    expect(announcer.announce).toHaveBeenCalledTimes(1);
  });

  it('should be able to pass in a duration', async () => {
    fixture.componentInstance.content = 'New content';
    fixture.componentInstance.duration = 1337;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    invokeMutationCallbacks();
    await fixture.whenStable();

    expect(announcer.announce).toHaveBeenCalledWith('New content', 'polite', 1337);
  });
});

function getLiveElement(): Element {
  return document.body.querySelector('.cdk-live-announcer-element')!;
}

@Component({
  template: `<button (click)="announce('Test')">Announce</button>`,
  imports: [A11yModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class TestApp {
  live = inject(LiveAnnouncer);

  announce(message: LiveAnnouncerMessage) {
    this.live.announce(message);
  }
}

@Component({
  template: '',
  host: {'[attr.aria-owns]': 'ariaOwns', 'aria-modal': 'true'},
  imports: [A11yModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class TestModal {
  ariaOwns: string | null = null;
}

@Component({
  template: `
    <div
      [cdkAriaLive]="politeness"
      [cdkAriaLiveDuration]="duration">{{content}}</div>`,
  imports: [A11yModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class DivWithCdkAriaLive {
  politeness: AriaLivePoliteness = 'polite';
  content = 'Initial content';
  duration!: number;
}
