/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {coerceCssPixelValue} from '@angular/cdk/coercion';
import {ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {AfterViewInit, ChangeDetectorRef, Component, ComponentRef, ElementRef, EmbeddedViewRef, EventEmitter, OnDestroy, Output, ViewChild} from '@angular/core';

import {FeatureHighlightCalloutContainer} from './feature-highlight-callout-container';
import {FeatureHighlightConfig} from './feature-highlight-config';

interface Coordinate {
  x: number;
  y: number;
}

type State = 'none'|'active_with_animation'|'active_without_animation'|
    'fade_accept'|'fade_dismiss';

const OPEN_ANIMATION_TIME_MS = 350;
const CLOSE_ANIMATION_TIME_MS = 200;

const DISMISS_EVENT = 'click';

/**
 * Internal component that holds feature highlight elements as well as
 * user-provided feature highlight content.hostelement
 */
@Component({
  selector: 'feature-highlight-container',
  templateUrl: './feature-highlight-container.ng.html',
  styleUrls: ['./feature-highlight-container.css'],
  host: {
    '[attr.aria-describedby]': 'config.ariaDescribedBy',
    '[attr.aria-label]': 'config.ariaLabel',
    '[attr.aria-labelledby]': 'config.ariaLabel ? null : config.ariaLabelledBy',
    '[attr.role]': '"alertdialog"',
    '[class.fade-accept]': 'state === "fade_accept"',
    '[class.fade-dismiss]': 'state === "fade_dismiss"',
    '[class.fade]': 'isInFadeState()',
    '[class.active-with-animation]': 'state === "active_with_animation"',
    '[class.active-without-animation]': 'state === "active_without_animation"',
    '[class.active]': 'isInActiveState()',
  },
})
export class FeatureHighlightContainer implements AfterViewInit, OnDestroy {
  @Output() afterOpened = new EventEmitter<void>();
  @Output() afterAccepted = new EventEmitter<void>();
  @Output() afterDismissed = new EventEmitter<void>();

  @ViewChild('rootDiv', {static: true}) rootDiv!: ElementRef<HTMLElement>;
  @ViewChild('innerCircle', {static: true})
  innerCircle!: ElementRef<HTMLElement>;
  @ViewChild('radialPulse', {static: true})
  radialPulse!: ElementRef<HTMLElement>;
  @ViewChild('outerCircle', {static: true})
  outerCircle!: ElementRef<HTMLElement>;

  @ViewChild('callout', {static: true}) callout!: ElementRef<HTMLElement>;
  @ViewChild('calloutContainer', {static: true})
  calloutContainer!: FeatureHighlightCalloutContainer;

  state: State = 'none';
  private _targetCenter: Coordinate = {x: 0, y: 0};

  constructor(
      private readonly _elementRef: ElementRef<HTMLElement>,
      private readonly _directionality: Directionality,
      private readonly _changeDetectorRef: ChangeDetectorRef,
      public config: FeatureHighlightConfig,
  ) {}

  /**
   * Override the existing configuration with new values.
   * @param newConfig Partial new configurations to override existing ones.
   */
  updateConfig(newConfig: Partial<FeatureHighlightConfig>) {
    this.config = {...this.config, ...newConfig};
  }

  /** Return the current configurations being used. */
  getConfig(): FeatureHighlightConfig {
    return this.config;
  }

  /**
   * Attach a template portal for the callout content to feature highlight
   * container.
   * @param portal Template portal to be attached as the callout content.
   */
  attachCalloutTemplatePortal<C>(portal: TemplatePortal<C>):
      EmbeddedViewRef<C> {
    return this.calloutContainer.attachTemplatePortal(portal);
  }

  /**
   * Attach a component portal for the callout content to feature highlight
   * container.
   * @param portal Component portal to be attached as the callout content.
   */
  attachCalloutComponentPortal<C>(portal: ComponentPortal<C>): ComponentRef<C> {
    return this.calloutContainer.attachComponentPortal(portal);
  }

  /**
   * Return true if feature highlight is in one of the fading states, i.e. after
   * a user clicks on somewhere to accept or dismiss the feature highlight, but
   * before the fading animation is done.
   */
  isInFadeState(): boolean {
    return this.state === 'fade_accept' || this.state === 'fade_dismiss';
  }

  /**
   * Return true if feature highlight is in one of the active states.
   */
  isInActiveState(): boolean {
    return this.state === 'active_with_animation' ||
        this.state === 'active_without_animation';
  }

  private _getTargetElement(): HTMLElement {
    return this.config.targetViewContainerRef.element.nativeElement as
        HTMLElement;
  }

  /**
   * Prevent interactions with the elements in feature highlight (outer circle,
   * inner circle, callout) from dismissing the feature highlight.
   */
  stopClickPropagation(event: Event) {
    event.stopPropagation();
  }

  private readonly _targetEventListener = (event: Event) => {
    event.stopPropagation();
    this.accept();
  };

  private readonly _bodyEventListener = () => {
    this.dismiss();
  };

  /** @override */
  ngAfterViewInit() {
    this._activate();
  }

  /** @override */
  ngOnDestroy() {
    this._removeEventListeners();
  }

  /** Position all feature highlight elements. */
  layout() {
    this._computeTargetCenter();
    this._positionInnerCircle();
    this._positionRadialPulse();
    this._positionCallout();
    this._positionOuterCircle();
    this._positionRootDivElement();
  }

  /**
   * Compute the center of the target. In LTR, the coordinate of the top left
   * corner of the target is (0, 0) and in RTL, the coordinate of the top right
   * corner of the target is (0, 0).
   */
  private _computeTargetCenter() {
    this._targetCenter = {
      x: this._getTargetElement().offsetWidth / 2,
      y: this._getTargetElement().offsetHeight / 2,
    };
  }

  /** Update left value in LTR or right value in RTL for an element. */
  private _updateLeft(style: CSSStyleDeclaration, left?: string|number) {
    const leftInPixel = coerceCssPixelValue(left);

    if (this._directionality.value === 'ltr') {
      style.left = leftInPixel;
    } else {
      style.right = leftInPixel;
    }
  }

  /** Update top value for an element. */
  private _updateTop(style: CSSStyleDeclaration, top?: string|number) {
    const topInPixel = coerceCssPixelValue(top);
    style.top = topInPixel;
  }

  /**
   * Get left offset for an element. For RTL, return the right offset instead.
   * Using this function can ensure we return the same value for both LTR
   * and RTL context.
   */
  private _getOffsetLeft(element: HTMLElement) {
    return this._directionality.value === 'ltr' ?
        element.offsetLeft :
        -(element.offsetLeft + element.offsetWidth);
  }

  /**
   * Position the inner circle. The inner circle has the same center as the
   * target element.
   */
  private _positionInnerCircle() {
    const style = this.innerCircle.nativeElement.style;

    style.width = coerceCssPixelValue(this.config.innerCircleDiameter);
    style.height = coerceCssPixelValue(this.config.innerCircleDiameter);

    const left =
        this._targetCenter.x - this.innerCircle.nativeElement.offsetWidth / 2;
    const top =
        this._targetCenter.y - this.innerCircle.nativeElement.offsetHeight / 2;
    this._updateLeft(style, left);
    this._updateTop(style, top);
  }

  /**
   * Position the radial pulse. Similar to the inner circle, the radial pulse
   * has the same center as the target element.
   */
  private _positionRadialPulse() {
    const style = this.radialPulse.nativeElement.style;

    style.width = coerceCssPixelValue(this.config.innerCircleDiameter);
    style.height = coerceCssPixelValue(this.config.innerCircleDiameter);
    style.top = this.innerCircle.nativeElement.style.top;

    if (this._directionality.value === 'ltr') {
      style.left = this.innerCircle.nativeElement.style.left;
    } else {
      style.right = this.innerCircle.nativeElement.style.right;
    }
  }

  /**
   * Position the callout. When the outer circle is bounded, position it based
   * automatically based on the calloutPosition config value so that:
   * (1) The top/bottom of the callout aligns with the bottom/top of the inner
   * circle.
   * (2) The end of the callout aligns with the center of the target element.
   */
  private _positionCallout() {
    // Callout in unbounded circle should be positioned manually by setting
    // left and top.
    let left = 0;
    let top = 0;
    const style = this.callout.nativeElement.style;

    if (!this.config.isOuterCircleBounded) {
      this._updateLeft(style, this.config.calloutLeft);
      this._updateTop(style, this.config.calloutTop);
      return;
    }

    const calloutPosition = this.config.calloutPosition;
    switch (calloutPosition) {
      case 'top_start':
      case 'bottom_start':
        left = this._targetCenter.x - this.callout.nativeElement.offsetWidth;
        break;
      case 'top_end':
      case 'bottom_end':
        left = this._targetCenter.x;
        break;
      default:
        throw new Error(`Cannot handle callout position ${calloutPosition}.`);
    }

    switch (calloutPosition) {
      case 'top_start':
      case 'top_end':
        top = this._targetCenter.y -
            this.innerCircle.nativeElement.offsetHeight / 2 -
            this.callout.nativeElement.offsetHeight;
        break;
      case 'bottom_start':
      case 'bottom_end':
        top = this._targetCenter.y +
            this.innerCircle.nativeElement.offsetHeight / 2;
        break;
      default:
        throw new Error(`Cannot handle callout position ${calloutPosition}.`);
    }

    this._updateLeft(style, left);
    this._updateTop(style, top);
  }

  /**
   * Position outer circle. When the outer circle is bounded, the outer circle
   * has the same center as the target element. When it's not bounded, we
   * compute the minimum box that includes both target element and callout.
   * The center of the box is the center of the outer circle, and the diameter
   * is equal to the diagonal length of the box, should the diameter be auto
   * determined.
   */
  private _positionOuterCircle() {
    let left = 0;
    let top = 0;
    const style = this.outerCircle.nativeElement.style;

    if (this.config.isOuterCircleBounded) {
      const diameter = this._computeBoundedOuterCircleDiameter();
      style.width = diameter;
      style.height = diameter;

      left = Math.floor(
          this._targetCenter.x -
          this.outerCircle.nativeElement.offsetWidth / 2);
      top = Math.floor(
          this._targetCenter.y -
          this.outerCircle.nativeElement.offsetHeight / 2);
      this._updateLeft(style, left);
      this._updateTop(style, top);

      return;
    }

    const calloutElement = this.callout.nativeElement;
    const innerCircleElement = this.innerCircle.nativeElement;

    const calloutLeft = this._getOffsetLeft(calloutElement);
    const calloutTop = calloutElement.offsetTop;
    const calloutWidth = calloutElement.offsetWidth;
    const calloutHeight = calloutElement.offsetHeight;

    const innerCircleLeft = this._getOffsetLeft(innerCircleElement);
    const innerCircleTop = innerCircleElement.offsetTop;
    const innerCircleWidth = innerCircleElement.offsetWidth;
    const innerCircleHeight = innerCircleElement.offsetHeight;

    const boxLeft = Math.min(calloutLeft, innerCircleLeft);
    const boxRight = Math.max(
        calloutLeft + calloutWidth, innerCircleLeft + innerCircleWidth);
    const boxTop = Math.min(calloutTop, innerCircleTop);
    const boxBottom = Math.max(
        calloutTop + calloutHeight, innerCircleTop + innerCircleHeight);
    const boxWidth = boxRight - boxLeft;
    const boxHeight = boxBottom - boxTop;

    let diameter = '';
    if (this.config.outerCircleDiameter) {
      diameter = coerceCssPixelValue(this.config.outerCircleDiameter);
    } else {
      diameter = `${Math.floor(Math.hypot(boxWidth, boxHeight))}px`;
    }

    style.width = diameter;
    style.height = diameter;
    style.transformOrigin = 'center center';

    left = Math.floor(
        boxLeft + boxWidth / 2 -
        this.outerCircle.nativeElement.offsetWidth / 2);
    top = Math.floor(
        boxTop + boxHeight / 2 -
        this.outerCircle.nativeElement.offsetHeight / 2);

    this._updateLeft(style, left);
    this._updateTop(style, top);
  }

  private _getDistance(c1: Coordinate, c2: Coordinate): number {
    return Math.floor(Math.hypot(c2.x - c1.x, c2.y - c1.y));
  }

  /**
   * Compute the diameter for the outer circle, if it's bounded. The center of
   * the outer circle is the same as the target element. The furthest corner
   * of the callout box from the target center should be on the outer circle,
   * so the radius of the outer circle is equal to the distance between the
   * center of the target element, and the furthest corner of the callout box.
   */
  private _computeBoundedOuterCircleDiameter(): string {
    if (this.config.outerCircleDiameter) {
      return coerceCssPixelValue(this.config.outerCircleDiameter);
    }

    const calloutElement = this.callout.nativeElement;

    const calloutLeft = this._getOffsetLeft(calloutElement);
    const calloutTop = calloutElement.offsetTop;
    const calloutWidth = calloutElement.offsetWidth;
    const calloutHeight = calloutElement.offsetHeight;

    let radius = 0;
    switch (this.config.calloutPosition) {
      case 'top_start':
        radius = this._getDistance(this._targetCenter, {
          x: calloutLeft,
          y: calloutTop,
        });
        break;
      case 'top_end':
        radius = this._getDistance(this._targetCenter, {
          x: calloutLeft + calloutWidth,
          y: calloutTop,
        });
        break;
      case 'bottom_start':
        radius = this._getDistance(this._targetCenter, {
          x: calloutLeft,
          y: calloutTop + calloutHeight,
        });
        break;
      case 'bottom_end':
        radius = this._getDistance(this._targetCenter, {
          x: calloutLeft + calloutWidth,
          y: calloutTop + calloutHeight,
        });
        break;
      default:
        throw new Error(
            `Cannot handle callout position ${this.config.calloutPosition}.`);
    }

    return `${Math.floor(radius * 2)}px`;
  }

  /**
   * Position the root div element so that it's overlayed with the target
   * element.
   */
  private _positionRootDivElement() {
    // Remove the left and top first so that the offsetLeft and offsetTop can
    // be computed correctly.
    const style = this.rootDiv.nativeElement.style;
    this._updateLeft(style, undefined);
    this._updateTop(style, undefined);

    // Only need to position the root element when the outer circle is bounded,
    // i.e. overlay is not needed.
    if (!this.config.isOuterCircleBounded) {
      return;
    }

    const targetOffsetLeft = this._getOffsetLeft(this._getTargetElement());
    const containerOffsetLeft =
        this._getOffsetLeft(this._elementRef.nativeElement);
    const left = targetOffsetLeft - containerOffsetLeft;
    const top = this._getTargetElement().offsetTop -
        this._elementRef.nativeElement.offsetTop;

    this._updateLeft(style, left);
    this._updateTop(style, top);
  }

  /** Activate feature highlight and display the animation. */
  private _activate() {
    this.layout();

    if (this.state === 'active_with_animation') {
      return;
    }

    this._changeAnimationState('active_without_animation');
    this._addEventListeners();

    // TODO(b/138400499) - Ideally we should emit afterOpened event when the
    // transitionend is triggered. However it doesn't look like catalyst flush()
    // triggers the transitionend event so there is no way to test the behavior.
    // We may be able to use flushMicrotasks() when migrating the component to
    // Angular upstream.
    setTimeout(() => {
      this._changeAnimationState('active_with_animation');
      this.afterOpened.emit();
    }, OPEN_ANIMATION_TIME_MS);

    // Mark the container for check so that it can react if the view container
    // is usign OnPush change detection.
    this._changeDetectorRef.markForCheck();
  }

  private _changeAnimationState(newState: State) {
    requestAnimationFrame(() => {
      this.state = newState;
      this._changeDetectorRef.markForCheck();
    });
  }

  /** Accept feature highlight programmatically. */
  accept() {
    this._deactivate(true);
  }

  /** Dismiss feature highlight programmatically. */
  dismiss() {
    this._deactivate(false);
  }

  /** Deactivate feature highlight and stop the animation. */
  private _deactivate(accepted: boolean) {
    this._changeAnimationState(accepted ? 'fade_accept' : 'fade_dismiss');
    this._removeEventListeners();

    setTimeout(() => {
      this._changeAnimationState('none');

      // Emit events after the animation is done.
      if (accepted) {
        this.afterAccepted.emit();
      } else {
        this.afterDismissed.emit();
      }
    }, CLOSE_ANIMATION_TIME_MS);

    // Mark the container for check so that it can react if the view container
    // is usign OnPush change detection.
    this._changeDetectorRef.markForCheck();
  }

  private _addEventListeners() {
    document.body.addEventListener(DISMISS_EVENT, this._bodyEventListener);
    this._getTargetElement().addEventListener(
        DISMISS_EVENT, this._targetEventListener);
  }

  private _removeEventListeners() {
    this._getTargetElement().removeEventListener(
        DISMISS_EVENT, this._targetEventListener);
    document.body.removeEventListener(DISMISS_EVENT, this._bodyEventListener);
  }
}
