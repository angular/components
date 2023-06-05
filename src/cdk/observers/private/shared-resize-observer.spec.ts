import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Component, ElementRef, inject, ViewChild} from '@angular/core';
import {SharedResizeObserver} from './shared-resize-observer';

describe('SharedResizeObserver', () => {
  const currentObservers = new Map<ResizeObserverBoxOptions, MockResizeObserver>();
  let fixture: ComponentFixture<TestComponent>;
  let instance: TestComponent;
  let resizeObserver: SharedResizeObserver;
  let originalResizeObserver: typeof ResizeObserver;
  let el1: Element;
  let el2: Element;

  /**
   * Mocked out resize observer that allows us to trigger the callback manually. It helps reduce
   * test flakines caused by browsers that invoke the callbacks with inconsistent timings.
   */
  class MockResizeObserver implements ResizeObserver {
    constructor(private _callback: ResizeObserverCallback, options?: ResizeObserverOptions) {
      currentObservers.set(options?.box || 'content-box', this);
    }

    observe(element: Element) {
      // The native observer triggers the callback when an element is observed for the first time.
      this.triggerCallback(element);
    }

    unobserve() {}
    disconnect() {}

    triggerCallback(target: Element) {
      this._callback(
        [
          {
            target,
            borderBoxSize: [],
            contentBoxSize: [],
            devicePixelContentBoxSize: [],
            contentRect: {} as DOMRect,
          },
        ],
        this,
      );
    }
  }

  beforeEach(() => {
    originalResizeObserver = ResizeObserver;
    window.ResizeObserver = MockResizeObserver;
    TestBed.configureTestingModule({
      declarations: [TestComponent],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    instance = fixture.componentInstance;
    resizeObserver = instance.resizeObserver;
    el1 = instance.el1.nativeElement;
    el2 = instance.el2.nativeElement;
  });

  afterEach(() => {
    window.ResizeObserver = originalResizeObserver;
    currentObservers.clear();
  });

  it('should return the same observable for the same element and same box', () => {
    const observable1 = resizeObserver.observe(el1);
    const observable2 = resizeObserver.observe(el1);
    expect(observable1).toBe(observable2);
  });

  it('should return different observables for different elements', () => {
    const observable1 = resizeObserver.observe(el1);
    const observable2 = resizeObserver.observe(el2);
    expect(observable1).not.toBe(observable2);
  });

  it('should return different observables for different boxes', () => {
    const observable1 = resizeObserver.observe(el1, {box: 'content-box'});
    const observable2 = resizeObserver.observe(el1, {box: 'border-box'});
    expect(observable1).not.toBe(observable2);
  });

  it('should return different observable after all subscriptions unsubscribed', () => {
    const observable1 = resizeObserver.observe(el1);
    const subscription1 = observable1.subscribe(() => {});
    const subscription2 = observable1.subscribe(() => {});
    subscription1.unsubscribe();
    const observable2 = resizeObserver.observe(el1);
    expect(observable1).toBe(observable2);
    subscription2.unsubscribe();
    const observable3 = resizeObserver.observe(el1);
    expect(observable1).not.toBe(observable3);
  });

  it('should receive an initial size on subscription', waitForAsync(async () => {
    const observable = resizeObserver.observe(el1);
    const resizeSpy1 = jasmine.createSpy('resize handler 1');
    observable.subscribe(resizeSpy1);
    fixture.detectChanges();
    expect(resizeSpy1).toHaveBeenCalled();
    const resizeSpy2 = jasmine.createSpy('resize handler 2');
    observable.subscribe(resizeSpy2);
    fixture.detectChanges();
    expect(resizeSpy2).toHaveBeenCalled();
  }));

  it('should receive events on resize', waitForAsync(async () => {
    const resizeSpy = jasmine.createSpy('resize handler');
    resizeObserver.observe(el1).subscribe(resizeSpy);
    fixture.detectChanges();
    resizeSpy.calls.reset();
    currentObservers.get('content-box')?.triggerCallback(el1);
    fixture.detectChanges();
    expect(resizeSpy).toHaveBeenCalled();
  }));

  it('should not receive events for other elements', waitForAsync(async () => {
    const resizeSpy1 = jasmine.createSpy('resize handler 1');
    const resizeSpy2 = jasmine.createSpy('resize handler 2');
    resizeObserver.observe(el1).subscribe(resizeSpy1);
    resizeObserver.observe(el2).subscribe(resizeSpy2);
    fixture.detectChanges();
    resizeSpy1.calls.reset();
    resizeSpy2.calls.reset();
    currentObservers.get('content-box')?.triggerCallback(el1);
    fixture.detectChanges();
    expect(resizeSpy1).toHaveBeenCalled();
    expect(resizeSpy2).not.toHaveBeenCalled();
  }));
});

@Component({
  template: `
    <div #el1></div>
    <div #el2></div>
  `,
})
export class TestComponent {
  @ViewChild('el1') el1: ElementRef<Element>;
  @ViewChild('el2') el2: ElementRef<Element>;
  resizeObserver = inject(SharedResizeObserver);
}
