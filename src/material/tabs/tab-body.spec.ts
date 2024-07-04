import {Direction, Directionality} from '@angular/cdk/bidi';
import {PortalModule, TemplatePortal} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {
  AfterContentInit,
  Component,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  provideZoneChangeDetection,
} from '@angular/core';
import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatRippleModule} from '@angular/material/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CdkScrollable, ScrollingModule} from '@angular/cdk/scrolling';
import {MatTabBody, MatTabBodyPortal} from './tab-body';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';

describe('MDC-based MatTabBody', () => {
  let dir: Direction = 'ltr';
  let dirChange: Subject<Direction> = new Subject<Direction>();
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });

  beforeEach(waitForAsync(() => {
    dir = 'ltr';
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        PortalModule,
        MatRippleModule,
        NoopAnimationsModule,
        MatTabBody,
        MatTabBodyPortal,
        SimpleTabBodyApp,
      ],
      providers: [{provide: Directionality, useFactory: () => ({value: dir, change: dirChange})}],
    });

    TestBed.compileComponents();
  }));

  describe('when initialized as center', () => {
    let fixture: ComponentFixture<SimpleTabBodyApp>;

    it('should be center position if origin is unchanged', () => {
      fixture = TestBed.createComponent(SimpleTabBodyApp);
      fixture.componentInstance.position = 0;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('center');
    });

    it('should be center position if origin is explicitly set to null', () => {
      fixture = TestBed.createComponent(SimpleTabBodyApp);
      fixture.componentInstance.position = 0;

      // It can happen that the `origin` is explicitly set to null through the Angular input
      // binding. This test should ensure that the body does properly such origin value.
      // The `MatTab` class sets the origin by default to null. See related issue: #12455
      fixture.componentInstance.origin = null;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('center');
    });

    describe('in LTR direction', () => {
      beforeEach(() => {
        dir = 'ltr';
        fixture = TestBed.createComponent(SimpleTabBodyApp);
      });
      it('should be left-origin-center position with negative or zero origin', () => {
        fixture.componentInstance.position = 0;
        fixture.componentInstance.origin = 0;
        fixture.detectChanges();

        expect(fixture.componentInstance.tabBody._position).toBe('left-origin-center');
      });

      it('should be right-origin-center position with positive nonzero origin', () => {
        fixture.componentInstance.position = 0;
        fixture.componentInstance.origin = 1;
        fixture.detectChanges();

        expect(fixture.componentInstance.tabBody._position).toBe('right-origin-center');
      });
    });

    describe('in RTL direction', () => {
      beforeEach(() => {
        dir = 'rtl';
        fixture = TestBed.createComponent(SimpleTabBodyApp);
      });

      it('should be right-origin-center position with negative or zero origin', () => {
        fixture.componentInstance.position = 0;
        fixture.componentInstance.origin = 0;
        fixture.detectChanges();

        expect(fixture.componentInstance.tabBody._position).toBe('right-origin-center');
      });

      it('should be left-origin-center position with positive nonzero origin', () => {
        fixture.componentInstance.position = 0;
        fixture.componentInstance.origin = 1;
        fixture.detectChanges();

        expect(fixture.componentInstance.tabBody._position).toBe('left-origin-center');
      });
    });
  });

  describe('should properly set the position in LTR', () => {
    let fixture: ComponentFixture<SimpleTabBodyApp>;

    beforeEach(() => {
      dir = 'ltr';
      fixture = TestBed.createComponent(SimpleTabBodyApp);
      fixture.detectChanges();
    });

    it('to be left position with negative position', () => {
      fixture.componentInstance.position = -1;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('left');
    });

    it('to be center position with zero position', () => {
      fixture.componentInstance.position = 0;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('center');
    });

    it('to be left position with positive position', () => {
      fixture.componentInstance.position = 1;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('right');
    });
  });

  describe('should properly set the position in RTL', () => {
    let fixture: ComponentFixture<SimpleTabBodyApp>;

    beforeEach(() => {
      dir = 'rtl';
      fixture = TestBed.createComponent(SimpleTabBodyApp);
      fixture.detectChanges();
    });

    it('to be right position with negative position', () => {
      fixture.componentInstance.position = -1;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('right');
    });

    it('to be center position with zero position', () => {
      fixture.componentInstance.position = 0;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('center');
    });

    it('to be left position with positive position', () => {
      fixture.componentInstance.position = 1;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('left');
    });
  });

  it('should update position if direction changed at runtime', () => {
    const fixture = TestBed.createComponent(SimpleTabBodyApp);

    fixture.componentInstance.position = 1;
    fixture.detectChanges();

    expect(fixture.componentInstance.tabBody._position).toBe('right');

    dirChange.next('rtl');
    dir = 'rtl';

    fixture.detectChanges();

    expect(fixture.componentInstance.tabBody._position).toBe('left');
  });

  it('should mark the tab body content as a scrollable container', () => {
    TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [
          CommonModule,
          PortalModule,
          MatRippleModule,
          NoopAnimationsModule,
          ScrollingModule,
          SimpleTabBodyApp,
        ],
      })
      .compileComponents();

    const fixture = TestBed.createComponent(SimpleTabBodyApp);
    const tabBodyContent = fixture.nativeElement.querySelector('.mat-mdc-tab-body-content');
    const scrollable = fixture.debugElement.query(By.directive(CdkScrollable));

    expect(scrollable).toBeTruthy();
    expect(scrollable.nativeElement).toBe(tabBodyContent);
  });
});

@Component({
  template: `
    <ng-template>Tab Body Content</ng-template>
    <mat-tab-body [content]="content" [position]="position" [origin]="origin"></mat-tab-body>
  `,
  standalone: true,
  imports: [CommonModule, PortalModule, MatRippleModule, MatTabBody],
})
class SimpleTabBodyApp implements AfterContentInit {
  content: TemplatePortal;
  position: number;
  origin: number | null;

  @ViewChild(MatTabBody) tabBody: MatTabBody;
  @ViewChild(TemplateRef) template: TemplateRef<any>;

  constructor(private _viewContainerRef: ViewContainerRef) {}

  ngAfterContentInit() {
    this.content = new TemplatePortal(this.template, this._viewContainerRef);
  }
}
