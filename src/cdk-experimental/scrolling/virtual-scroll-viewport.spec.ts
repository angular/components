import {Component, ViewChild} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed} from '@angular/core/testing';
import {ScrollingModule} from './scrolling-module';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';

describe('Basic CdkVirtualScrollViewport', () => {
  let fixture: ComponentFixture<BasicViewport>;
  let viewport: CdkVirtualScrollViewport;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ScrollingModule],
      declarations: [BasicViewport],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicViewport);
    viewport = fixture.componentInstance.viewport;
  });

  it('should sanitize transform inputs', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    viewport.orientation = 'arbitrary string as orientation' as any;
    viewport.setRenderedContentOffset(
        'arbitrary string as offset' as any, 'arbitrary string as to' as any);
    fixture.detectChanges();
    flush();

    expect((viewport._renderedContentTransform as any).changingThisBreaksApplicationSecurity)
        .toEqual('translateY(NaNpx)');
  }));

  fit('should update content size', fakeAsync(() => {
    viewport.elementRef.nativeElement.style['height'] = '300px';
    viewport.updateViewportSize();
    fixture.detectChanges();
    const size = viewport.getViewportSize();

    expect(size).toBe(300);

    viewport.elementRef.nativeElement.style['height'] = '500px';
    viewport.updateViewportSize();
    fixture.detectChanges();
    const newSize = viewport.getViewportSize();
    const newLength = viewport.getRenderedRange();

    expect(newSize).toBe(500);
  }));
});

@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="50">
      <span *cdkVirtualFor="let item of items">{{item}}</span>
    </cdk-virtual-scroll-viewport>
  `
})
class BasicViewport {
  @ViewChild(CdkVirtualScrollViewport) viewport;

  items = Array(10).fill(0);
}
