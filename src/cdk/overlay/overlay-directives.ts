/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Direction, Directionality} from '@angular/cdk/bidi';
import {ESCAPE, hasModifierKey} from '@angular/cdk/keycodes';
import {TemplatePortal} from '@angular/cdk/portal';
import {
  Directive,
  ElementRef,
  EventEmitter,
  InjectionToken,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  inject,
} from '@angular/core';
import {_getEventTarget} from '@angular/cdk/platform';
import {Subscription} from 'rxjs';
import {takeWhile} from 'rxjs/operators';
import {Overlay} from './overlay';
import {OverlayConfig} from './overlay-config';
import {OverlayRef} from './overlay-ref';
import {ConnectedOverlayPositionChange} from './position/connected-position';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin,
} from './position/flexible-connected-position-strategy';
import {RepositionScrollStrategy, ScrollStrategy} from './scroll/index';

/** Default set of positions for the overlay. Follows the behavior of a dropdown. */
const defaultPositionList: ConnectedPosition[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
  },
];

/** Injection token that determines the scroll handling while the connected overlay is open. */
export const CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
  'cdk-connected-overlay-scroll-strategy',
  {
    providedIn: 'root',
    factory: () => {
      const overlay = inject(Overlay);
      return () => overlay.scrollStrategies.reposition();
    },
  },
);

/**
 * Directive applied to an element to make it usable as an origin for an Overlay using a
 * ConnectedPositionStrategy.
 */
@Directive({
  selector: '[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]',
  exportAs: 'cdkOverlayOrigin',
})
export class CdkOverlayOrigin {
  elementRef = inject(ElementRef);

  constructor(...args: unknown[]);
  constructor() {}
}

/**
 * Directive to facilitate declarative creation of an
 * Overlay using a FlexibleConnectedPositionStrategy.
 */
@Directive({
  selector: '[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]',
  exportAs: 'cdkConnectedOverlay',
})
export class CdkConnectedOverlay implements OnDestroy, OnChanges {
  private _overlay = inject(Overlay);
  private _dir = inject(Directionality, {optional: true});

  private _overlayRef: OverlayRef | undefined;
  private _templatePortal: TemplatePortal;
  private _backdropSubscription = Subscription.EMPTY;
  private _attachSubscription = Subscription.EMPTY;
  private _detachSubscription = Subscription.EMPTY;
  private _positionSubscription = Subscription.EMPTY;
  private _offsetX: number;
  private _offsetY: number;
  private _position: FlexibleConnectedPositionStrategy;
  private _scrollStrategyFactory = inject(CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY);
  private _disposeOnNavigation = false;
  private _ngZone = inject(NgZone);

  /** Origin for the connected overlay. */
  @Input('cdkConnectedOverlayOrigin')
  origin: CdkOverlayOrigin | FlexibleConnectedPositionStrategyOrigin;

  /** Registered connected position pairs. */
  @Input('cdkConnectedOverlayPositions') positions: ConnectedPosition[];

  /**
   * This input overrides the positions input if specified. It lets users pass
   * in arbitrary positioning strategies.
   */
  @Input('cdkConnectedOverlayPositionStrategy') positionStrategy: FlexibleConnectedPositionStrategy;

  /** The offset in pixels for the overlay connection point on the x-axis */
  @Input('cdkConnectedOverlayOffsetX')
  get offsetX(): number {
    return this._offsetX;
  }
  set offsetX(offsetX: number) {
    this._offsetX = offsetX;

    if (this._position) {
      this._updatePositionStrategy(this._position);
    }
  }

  /** The offset in pixels for the overlay connection point on the y-axis */
  @Input('cdkConnectedOverlayOffsetY')
  get offsetY() {
    return this._offsetY;
  }
  set offsetY(offsetY: number) {
    this._offsetY = offsetY;

    if (this._position) {
      this._updatePositionStrategy(this._position);
    }
  }

  /** The width of the overlay panel. */
  @Input('cdkConnectedOverlayWidth') width: number | string;

  /** The height of the overlay panel. */
  @Input('cdkConnectedOverlayHeight') height: number | string;

  /** The min width of the overlay panel. */
  @Input('cdkConnectedOverlayMinWidth') minWidth: number | string;

  /** The min height of the overlay panel. */
  @Input('cdkConnectedOverlayMinHeight') minHeight: number | string;

  /** The custom class to be set on the backdrop element. */
  @Input('cdkConnectedOverlayBackdropClass') backdropClass: string | string[];

  /** The custom class to add to the overlay pane element. */
  @Input('cdkConnectedOverlayPanelClass') panelClass: string | string[];

  /** Margin between the overlay and the viewport edges. */
  @Input('cdkConnectedOverlayViewportMargin') viewportMargin: number = 0;

  /** Strategy to be used when handling scroll events while the overlay is open. */
  @Input('cdkConnectedOverlayScrollStrategy') scrollStrategy: ScrollStrategy;

  /** Whether the overlay is open. */
  @Input('cdkConnectedOverlayOpen') open: boolean = false;

  /** Whether the overlay can be closed by user interaction. */
  @Input('cdkConnectedOverlayDisableClose') disableClose: boolean = false;

  /** CSS selector which to set the transform origin. */
  @Input('cdkConnectedOverlayTransformOriginOn') transformOriginSelector: string;

  /** Whether or not the overlay should attach a backdrop. */
  @Input({alias: 'cdkConnectedOverlayHasBackdrop', transform: booleanAttribute})
  hasBackdrop: boolean = false;

  /** Whether or not the overlay should be locked when scrolling. */
  @Input({alias: 'cdkConnectedOverlayLockPosition', transform: booleanAttribute})
  lockPosition: boolean = false;

  /** Whether the overlay's width and height can be constrained to fit within the viewport. */
  @Input({alias: 'cdkConnectedOverlayFlexibleDimensions', transform: booleanAttribute})
  flexibleDimensions: boolean = false;

  /** Whether the overlay can grow after the initial open when flexible positioning is turned on. */
  @Input({alias: 'cdkConnectedOverlayGrowAfterOpen', transform: booleanAttribute})
  growAfterOpen: boolean = false;

  /** Whether the overlay can be pushed on-screen if none of the provided positions fit. */
  @Input({alias: 'cdkConnectedOverlayPush', transform: booleanAttribute}) push: boolean = false;

  /** Whether the overlay should be disposed of when the user goes backwards/forwards in history. */
  @Input({alias: 'cdkConnectedOverlayDisposeOnNavigation', transform: booleanAttribute})
  get disposeOnNavigation(): boolean {
    return this._disposeOnNavigation;
  }
  set disposeOnNavigation(value: boolean) {
    this._disposeOnNavigation = value;
  }

  /** Event emitted when the backdrop is clicked. */
  @Output() readonly backdropClick = new EventEmitter<MouseEvent>();

  /** Event emitted when the position has changed. */
  @Output() readonly positionChange = new EventEmitter<ConnectedOverlayPositionChange>();

  /** Event emitted when the overlay has been attached. */
  @Output() readonly attach = new EventEmitter<void>();

  /** Event emitted when the overlay has been detached. */
  @Output() readonly detach = new EventEmitter<void>();

  /** Emits when there are keyboard events that are targeted at the overlay. */
  @Output() readonly overlayKeydown = new EventEmitter<KeyboardEvent>();

  /** Emits when there are mouse outside click events that are targeted at the overlay. */
  @Output() readonly overlayOutsideClick = new EventEmitter<MouseEvent>();

  constructor(...args: unknown[]);

  // TODO(jelbourn): inputs for size, scroll behavior, animation, etc.

  constructor() {
    const templateRef = inject<TemplateRef<any>>(TemplateRef);
    const viewContainerRef = inject(ViewContainerRef);

    this._templatePortal = new TemplatePortal(templateRef, viewContainerRef);
    this.scrollStrategy = this._scrollStrategyFactory();
  }

  /** The associated overlay reference. */
  get overlayRef(): OverlayRef {
    return this._overlayRef!;
  }

  /** The element's layout direction. */
  get dir(): Direction {
    return this._dir ? this._dir.value : 'ltr';
  }

  ngOnDestroy() {
    this._attachSubscription.unsubscribe();
    this._detachSubscription.unsubscribe();
    this._backdropSubscription.unsubscribe();
    this._positionSubscription.unsubscribe();
    this._overlayRef?.dispose();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this._position) {
      this._updatePositionStrategy(this._position);
      this._overlayRef?.updateSize({
        width: this.width,
        minWidth: this.minWidth,
        height: this.height,
        minHeight: this.minHeight,
      });

      if (changes['origin'] && this.open) {
        this._position.apply();
      }
    }

    if (changes['open']) {
      this.open ? this.attachOverlay() : this.detachOverlay();
    }
  }

  /** Creates an overlay */
  private _createOverlay() {
    if (!this.positions || !this.positions.length) {
      this.positions = defaultPositionList;
    }

    const overlayRef = (this._overlayRef = this._overlay.create(this._buildConfig()));
    this._attachSubscription = overlayRef.attachments().subscribe(() => this.attach.emit());
    this._detachSubscription = overlayRef.detachments().subscribe(() => this.detach.emit());
    overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      this.overlayKeydown.next(event);

      if (event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event)) {
        event.preventDefault();
        this.detachOverlay();
      }
    });

    this._overlayRef.outsidePointerEvents().subscribe((event: MouseEvent) => {
      const origin = this._getOriginElement();
      const target = _getEventTarget(event) as Element | null;

      if (!origin || (origin !== target && !origin.contains(target))) {
        this.overlayOutsideClick.next(event);
      }
    });
  }

  /** Builds the overlay config based on the directive's inputs */
  private _buildConfig(): OverlayConfig {
    const positionStrategy = (this._position =
      this.positionStrategy || this._createPositionStrategy());
    const overlayConfig = new OverlayConfig({
      direction: this._dir || 'ltr',
      positionStrategy,
      scrollStrategy: this.scrollStrategy,
      hasBackdrop: this.hasBackdrop,
      disposeOnNavigation: this.disposeOnNavigation,
    });

    if (this.width || this.width === 0) {
      overlayConfig.width = this.width;
    }

    if (this.height || this.height === 0) {
      overlayConfig.height = this.height;
    }

    if (this.minWidth || this.minWidth === 0) {
      overlayConfig.minWidth = this.minWidth;
    }

    if (this.minHeight || this.minHeight === 0) {
      overlayConfig.minHeight = this.minHeight;
    }

    if (this.backdropClass) {
      overlayConfig.backdropClass = this.backdropClass;
    }

    if (this.panelClass) {
      overlayConfig.panelClass = this.panelClass;
    }

    return overlayConfig;
  }

  /** Updates the state of a position strategy, based on the values of the directive inputs. */
  private _updatePositionStrategy(positionStrategy: FlexibleConnectedPositionStrategy) {
    const positions: ConnectedPosition[] = this.positions.map(currentPosition => ({
      originX: currentPosition.originX,
      originY: currentPosition.originY,
      overlayX: currentPosition.overlayX,
      overlayY: currentPosition.overlayY,
      offsetX: currentPosition.offsetX || this.offsetX,
      offsetY: currentPosition.offsetY || this.offsetY,
      panelClass: currentPosition.panelClass || undefined,
    }));

    return positionStrategy
      .setOrigin(this._getOrigin())
      .withPositions(positions)
      .withFlexibleDimensions(this.flexibleDimensions)
      .withPush(this.push)
      .withGrowAfterOpen(this.growAfterOpen)
      .withViewportMargin(this.viewportMargin)
      .withLockedPosition(this.lockPosition)
      .withTransformOriginOn(this.transformOriginSelector);
  }

  /** Returns the position strategy of the overlay to be set on the overlay config */
  private _createPositionStrategy(): FlexibleConnectedPositionStrategy {
    const strategy = this._overlay.position().flexibleConnectedTo(this._getOrigin());
    this._updatePositionStrategy(strategy);
    return strategy;
  }

  private _getOrigin(): FlexibleConnectedPositionStrategyOrigin {
    if (this.origin instanceof CdkOverlayOrigin) {
      return this.origin.elementRef;
    } else {
      return this.origin;
    }
  }

  private _getOriginElement(): Element | null {
    if (this.origin instanceof CdkOverlayOrigin) {
      return this.origin.elementRef.nativeElement;
    }

    if (this.origin instanceof ElementRef) {
      return this.origin.nativeElement;
    }

    if (typeof Element !== 'undefined' && this.origin instanceof Element) {
      return this.origin;
    }

    return null;
  }

  /** Attaches the overlay. */
  attachOverlay() {
    if (!this._overlayRef) {
      this._createOverlay();
    } else {
      // Update the overlay size, in case the directive's inputs have changed
      this._overlayRef.getConfig().hasBackdrop = this.hasBackdrop;
    }

    if (!this._overlayRef!.hasAttached()) {
      this._overlayRef!.attach(this._templatePortal);
    }

    if (this.hasBackdrop) {
      this._backdropSubscription = this._overlayRef!.backdropClick().subscribe(event => {
        this.backdropClick.emit(event);
      });
    } else {
      this._backdropSubscription.unsubscribe();
    }

    this._positionSubscription.unsubscribe();

    // Only subscribe to `positionChanges` if requested, because putting
    // together all the information for it can be expensive.
    if (this.positionChange.observers.length > 0) {
      this._positionSubscription = this._position.positionChanges
        .pipe(takeWhile(() => this.positionChange.observers.length > 0))
        .subscribe(position => {
          this._ngZone.run(() => this.positionChange.emit(position));

          if (this.positionChange.observers.length === 0) {
            this._positionSubscription.unsubscribe();
          }
        });
    }

    this.open = true;
  }

  /** Detaches the overlay. */
  detachOverlay() {
    this._overlayRef?.detach();
    this._backdropSubscription.unsubscribe();
    this._positionSubscription.unsubscribe();
    this.open = false;
  }
}

/** @docs-private */
export function CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY(
  overlay: Overlay,
): () => RepositionScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER = {
  provide: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY,
};
