import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Component, ElementRef, inject, ViewChild} from '@angular/core';
import {SharedResizeObserver} from './shared-resize-observer';

describe('SharedResizeObserver', () => {
  let fixture: ComponentFixture<TestComponent>;
  let instance: TestComponent;
  let resizeObserver: SharedResizeObserver;
  let el1: Element;
  let el2: Element;

  async function waitForResize() {
    fixture.detectChanges();
    await new Promise(r => setTimeout(r, 16));
  }

  beforeEach(() => {
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
    await waitForResize();
    expect(resizeSpy1).toHaveBeenCalled();
    const resizeSpy2 = jasmine.createSpy('resize handler 2');
    observable.subscribe(resizeSpy2);
    await waitForResize();
    expect(resizeSpy2).toHaveBeenCalled();
  }));

  it('should receive events on resize', waitForAsync(async () => {
    const resizeSpy = jasmine.createSpy('resize handler');
    resizeObserver.observe(el1).subscribe(resizeSpy);
    await waitForResize();
    resizeSpy.calls.reset();
    instance.el1Width = 1;
    await waitForResize();
    expect(resizeSpy).toHaveBeenCalled();
  }));

  it('should not receive events for other elements', waitForAsync(async () => {
    const resizeSpy1 = jasmine.createSpy('resize handler 1');
    const resizeSpy2 = jasmine.createSpy('resize handler 2');
    resizeObserver.observe(el1).subscribe(resizeSpy1);
    resizeObserver.observe(el2).subscribe(resizeSpy2);
    await waitForResize();
    resizeSpy1.calls.reset();
    resizeSpy2.calls.reset();
    instance.el1Width = 1;
    await waitForResize();
    expect(resizeSpy1).toHaveBeenCalled();
    expect(resizeSpy2).not.toHaveBeenCalled();
  }));
});

@Component({
  template: `
    <div #el1 [style.height.px]="1" [style.width.px]="el1Width"></div>
    <div #el2 [style.height.px]="1" [style.width.px]="el2Width"></div>
  `,
})
export class TestComponent {
  @ViewChild('el1') el1: ElementRef<Element>;
  @ViewChild('el2') el2: ElementRef<Element>;
  resizeObserver = inject(SharedResizeObserver);
  el1Width = 0;
  el2Width = 0;
}
