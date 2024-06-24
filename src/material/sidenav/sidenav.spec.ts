import {CommonModule} from '@angular/common';
import {Component, ViewChild} from '@angular/core';
import {TestBed, fakeAsync, tick, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatSidenav, MatSidenavContainer, MatSidenavModule} from './index';

describe('MatSidenav', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSidenavModule,
        NoopAnimationsModule,
        CommonModule,
        SidenavWithFixedPosition,
        IndirectDescendantSidenav,
        NestedSidenavContainers,
      ],
    });

    TestBed.compileComponents();
  }));

  it('should be fixed position when in fixed mode', () => {
    const fixture = TestBed.createComponent(SidenavWithFixedPosition);
    fixture.detectChanges();
    const sidenavEl = fixture.debugElement.query(By.directive(MatSidenav))!.nativeElement;

    expect(sidenavEl.classList).toContain('mat-sidenav-fixed');

    fixture.componentInstance.fixed = false;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(sidenavEl.classList).not.toContain('mat-sidenav-fixed');
  });

  it('should set fixed bottom and top when in fixed mode', () => {
    const fixture = TestBed.createComponent(SidenavWithFixedPosition);
    fixture.detectChanges();
    const sidenavEl = fixture.debugElement.query(By.directive(MatSidenav))!.nativeElement;

    expect(sidenavEl.style.top).toBe('20px');
    expect(sidenavEl.style.bottom).toBe('30px');

    fixture.componentInstance.fixed = false;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(sidenavEl.style.top).toBeFalsy();
    expect(sidenavEl.style.bottom).toBeFalsy();
  });

  it('should pick up sidenavs that are not direct descendants', fakeAsync(() => {
    const fixture = TestBed.createComponent(IndirectDescendantSidenav);
    fixture.detectChanges();

    expect(fixture.componentInstance.sidenav.opened).toBe(false);

    fixture.componentInstance.container.open();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(fixture.componentInstance.sidenav.opened).toBe(true);
  }));

  it('should not pick up sidenavs from nested containers', fakeAsync(() => {
    const fixture = TestBed.createComponent(NestedSidenavContainers);
    const instance = fixture.componentInstance;
    fixture.detectChanges();

    expect(instance.outerSidenav.opened).toBe(false);
    expect(instance.innerSidenav.opened).toBe(false);

    instance.outerContainer.open();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(instance.outerSidenav.opened).toBe(true);
    expect(instance.innerSidenav.opened).toBe(false);

    instance.innerContainer.open();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(instance.outerSidenav.opened).toBe(true);
    expect(instance.innerSidenav.opened).toBe(true);
  }));
});

@Component({
  template: `
    <mat-sidenav-container>
      <mat-sidenav
          #drawer
          [fixedInViewport]="fixed"
          [fixedTopGap]="fixedTop"
          [fixedBottomGap]="fixedBottom">
        Drawer.
      </mat-sidenav>
      <mat-sidenav-content>
        Some content.
      </mat-sidenav-content>
    </mat-sidenav-container>`,
  standalone: true,
  imports: [MatSidenavModule, CommonModule],
})
class SidenavWithFixedPosition {
  fixed = true;
  fixedTop = 20;
  fixedBottom = 30;
}

@Component({
  // Note that we need the `@if` so that there's an embedded
  // view between the container and the sidenav.
  template: `
    <mat-sidenav-container #container>
      @if (true) {
        <mat-sidenav #sidenav>Sidenav.</mat-sidenav>
      }
      <mat-sidenav-content>Some content.</mat-sidenav-content>
    </mat-sidenav-container>`,
  standalone: true,
  imports: [MatSidenavModule, CommonModule],
})
class IndirectDescendantSidenav {
  @ViewChild('container') container: MatSidenavContainer;
  @ViewChild('sidenav') sidenav: MatSidenav;
}

@Component({
  template: `
    <mat-sidenav-container #outerContainer>
      <mat-sidenav #outerSidenav>Sidenav</mat-sidenav>
      <mat-sidenav-content>
        <mat-sidenav-container #innerContainer>
          <mat-sidenav #innerSidenav>Sidenav</mat-sidenav>
        </mat-sidenav-container>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  standalone: true,
  imports: [MatSidenavModule, CommonModule],
})
class NestedSidenavContainers {
  @ViewChild('outerContainer') outerContainer: MatSidenavContainer;
  @ViewChild('outerSidenav') outerSidenav: MatSidenav;
  @ViewChild('innerContainer') innerContainer: MatSidenavContainer;
  @ViewChild('innerSidenav') innerSidenav: MatSidenav;
}
