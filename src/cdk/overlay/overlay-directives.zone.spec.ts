import {Component, ElementRef, NgZone, ViewChild, provideZoneChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CdkConnectedOverlay, CdkOverlayOrigin} from './overlay-directives';
import {OverlayModule} from './overlay-module';
import {
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin,
} from './public-api';
import {ScrollStrategy} from './scroll';

describe('Overlay directives Zone.js integration', () => {
  let fixture: ComponentFixture<ConnectedOverlayDirectiveTest>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, ConnectedOverlayDirectiveTest, ConnectedOverlayPropertyInitOrder],
      providers: [provideZoneChangeDetection()],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectedOverlayDirectiveTest);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  });

  describe('outputs', () => {
    it('should emit the position change handler inside the zone', () => {
      let callsInZone: boolean[] = [];

      fixture.componentInstance.positionChangeHandler.and.callFake(() => {
        callsInZone.push(NgZone.isInAngularZone());
      });
      fixture.componentInstance.isOpen = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(callsInZone).toEqual([true]);
    });
  });
});

@Component({
  template: `
    <button cdk-overlay-origin id="trigger" #trigger="cdkOverlayOrigin">Toggle menu</button>
    <button cdk-overlay-origin id="otherTrigger" #otherTrigger="cdkOverlayOrigin">Toggle menu</button>
    <button id="nonDirectiveTrigger" #nonDirectiveTrigger>Toggle menu</button>

    <ng-template cdk-connected-overlay
              [cdkConnectedOverlayOpen]="isOpen"
              [cdkConnectedOverlayWidth]="width"
              [cdkConnectedOverlayHeight]="height"
              [cdkConnectedOverlayPositionStrategy]="positionStrategy"
              [cdkConnectedOverlayOrigin]="triggerOverride || trigger"
              [cdkConnectedOverlayHasBackdrop]="hasBackdrop"
              [cdkConnectedOverlayViewportMargin]="viewportMargin"
              [cdkConnectedOverlayFlexibleDimensions]="flexibleDimensions"
              [cdkConnectedOverlayGrowAfterOpen]="growAfterOpen"
              [cdkConnectedOverlayPush]="push"
              [cdkConnectedOverlayScrollStrategy]="scrollStrategy"
              [cdkConnectedOverlayDisableClose]="disableClose"
              cdkConnectedOverlayBackdropClass="mat-test-class"
              cdkConnectedOverlayPanelClass="cdk-test-panel-class"
              (backdropClick)="backdropClickHandler($event)"
              [cdkConnectedOverlayOffsetX]="offsetX"
              [cdkConnectedOverlayOffsetY]="offsetY"
              (positionChange)="positionChangeHandler($event)"
              (attach)="attachHandler()"
              (detach)="detachHandler()"
              (overlayKeydown)="keydownHandler($event)"
              [cdkConnectedOverlayMinWidth]="minWidth"
              [cdkConnectedOverlayMinHeight]="minHeight"
              [cdkConnectedOverlayPositions]="positionOverrides"
              [cdkConnectedOverlayTransformOriginOn]="transformOriginSelector">
      <p>Menu content</p>
    </ng-template>`,
  imports: [OverlayModule],
})
class ConnectedOverlayDirectiveTest {
  @ViewChild(CdkConnectedOverlay) connectedOverlayDirective: CdkConnectedOverlay;
  @ViewChild('trigger') trigger: CdkOverlayOrigin;
  @ViewChild('otherTrigger') otherTrigger: CdkOverlayOrigin;
  @ViewChild('nonDirectiveTrigger') nonDirectiveTrigger: ElementRef<HTMLElement>;

  isOpen = false;
  width: number | string;
  height: number | string;
  minWidth: number | string;
  positionStrategy: FlexibleConnectedPositionStrategy;
  minHeight: number | string;
  offsetX: number;
  offsetY: number;
  triggerOverride: CdkOverlayOrigin | FlexibleConnectedPositionStrategyOrigin;
  hasBackdrop: boolean;
  disableClose: boolean;
  viewportMargin: number;
  flexibleDimensions: boolean;
  growAfterOpen: boolean;
  push: boolean;
  scrollStrategy: ScrollStrategy;
  backdropClickHandler = jasmine.createSpy('backdropClick handler');
  positionChangeHandler = jasmine.createSpy('positionChange handler');
  keydownHandler = jasmine.createSpy('keydown handler');
  positionOverrides: ConnectionPositionPair[];
  attachHandler = jasmine.createSpy('attachHandler').and.callFake(() => {
    const overlayElement = this.connectedOverlayDirective.overlayRef.overlayElement;
    this.attachResult = overlayElement.querySelector('p') as HTMLElement;
  });
  detachHandler = jasmine.createSpy('detachHandler');
  attachResult: HTMLElement;
  transformOriginSelector: string;
}

@Component({
  template: `
    <button cdk-overlay-origin #trigger="cdkOverlayOrigin">Toggle menu</button>
    <ng-template cdk-connected-overlay>Menu content</ng-template>`,
  imports: [OverlayModule],
})
class ConnectedOverlayPropertyInitOrder {
  @ViewChild(CdkConnectedOverlay) connectedOverlayDirective: CdkConnectedOverlay;
  @ViewChild('trigger') trigger: CdkOverlayOrigin;
}
