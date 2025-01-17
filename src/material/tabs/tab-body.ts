/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Direction, Directionality} from '@angular/cdk/bidi';
import {CdkPortalOutlet, TemplatePortal} from '@angular/cdk/portal';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {
  ANIMATION_MODULE_TYPE,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
  afterNextRender,
  inject,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {startWith} from 'rxjs/operators';

/**
 * The portal host directive for the contents of the tab.
 * @docs-private
 */
@Directive({selector: '[matTabBodyHost]'})
export class MatTabBodyPortal extends CdkPortalOutlet implements OnInit, OnDestroy {
  private _host = inject(MatTabBody);

  /** Subscription to events for when the tab body begins centering. */
  private _centeringSub = Subscription.EMPTY;
  /** Subscription to events for when the tab body finishes leaving from center position. */
  private _leavingSub = Subscription.EMPTY;

  constructor(...args: unknown[]);

  constructor() {
    super();
  }

  /** Set initial visibility or set up subscription for changing visibility. */
  override ngOnInit(): void {
    super.ngOnInit();

    this._centeringSub = this._host._beforeCentering
      .pipe(startWith(this._host._isCenterPosition()))
      .subscribe((isCentering: boolean) => {
        if (this._host._content && isCentering && !this.hasAttached()) {
          this.attach(this._host._content);
        }
      });

    this._leavingSub = this._host._afterLeavingCenter.subscribe(() => {
      if (!this._host.preserveContent) {
        this.detach();
      }
    });
  }

  /** Clean up centering subscription. */
  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this._centeringSub.unsubscribe();
    this._leavingSub.unsubscribe();
  }
}

/**
 * These position states are used internally as animation states for the tab body. Setting the
 * position state to left, right, or center will transition the tab body from its current
 * position to its respective state. If there is not current position (void, in the case of a new
 * tab body), then there will be no transition animation to its state.
 *
 * In the case of a new tab body that should immediately be centered with an animating transition,
 * then left-origin-center or right-origin-center can be used, which will use left or right as its
 * pseudo-prior state.
 *
 * @deprecated Will stop being exported.
 * @breaking-change 21.0.0
 */
export type MatTabBodyPositionState = 'left' | 'center' | 'right';

/**
 * The origin state is an internally used state that is set on a new tab body indicating if it
 * began to the left or right of the prior selected index. For example, if the selected index was
 * set to 1, and a new tab is created and selected at index 2, then the tab body would have an
 * origin of right because its index was greater than the prior selected index.
 *
 * @deprecated No longer being used. Will be removed.
 * @breaking-change 21.0.0
 */
export type MatTabBodyOriginState = 'left' | 'right';

/**
 * Wrapper for the contents of a tab.
 * @docs-private
 */
@Component({
  selector: 'mat-tab-body',
  templateUrl: 'tab-body.html',
  styleUrl: 'tab-body.css',
  encapsulation: ViewEncapsulation.None,
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  host: {
    'class': 'mat-mdc-tab-body',
    // In most cases the `visibility: hidden` that we set on the off-screen content is enough
    // to stop interactions with it, but if a child element sets its own `visibility`, it'll
    // override the one from the parent. This ensures that even those elements will be removed
    // from the accessibility tree.
    '[attr.inert]': '_position === "center" ? null : ""',
  },
  imports: [MatTabBodyPortal, CdkScrollable],
})
export class MatTabBody implements OnInit, OnDestroy {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _dir = inject(Directionality, {optional: true});
  private _ngZone = inject(NgZone);
  private _injector = inject(Injector);
  private _renderer = inject(Renderer2);
  private _animationsModule = inject(ANIMATION_MODULE_TYPE, {optional: true});
  private _eventCleanups?: (() => void)[];
  private _initialized: boolean;
  private _fallbackTimer: ReturnType<typeof setTimeout>;

  /** Current position of the tab-body in the tab-group. Zero means that the tab is visible. */
  private _positionIndex: number;

  /** Subscription to the directionality change observable. */
  private _dirChangeSubscription = Subscription.EMPTY;

  /** Current position of the body within the tab group. */
  _position: MatTabBodyPositionState;

  /** Previous position of the body. */
  protected _previousPosition: MatTabBodyPositionState | undefined;

  /** Event emitted when the tab begins to animate towards the center as the active tab. */
  @Output() readonly _onCentering: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted before the centering of the tab begins. */
  @Output() readonly _beforeCentering: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Event emitted before the centering of the tab begins. */
  readonly _afterLeavingCenter: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted when the tab completes its animation towards the center. */
  @Output() readonly _onCentered: EventEmitter<void> = new EventEmitter<void>(true);

  /** The portal host inside of this container into which the tab body content will be loaded. */
  @ViewChild(MatTabBodyPortal) _portalHost: MatTabBodyPortal;

  /** Element in which the content is rendered. */
  @ViewChild('content') _contentElement: ElementRef<HTMLElement> | undefined;

  /** The tab body content to display. */
  @Input('content') _content: TemplatePortal;

  // Note that the default value will always be overwritten by `MatTabBody`, but we need one
  // anyway to prevent the animations module from throwing an error if the body is used on its own.
  /** Duration for the tab's animation. */
  @Input() animationDuration: string = '500ms';

  /** Whether the tab's content should be kept in the DOM while it's off-screen. */
  @Input() preserveContent: boolean = false;

  /** The shifted index position of the tab body, where zero represents the active center tab. */
  @Input()
  set position(position: number) {
    this._positionIndex = position;
    this._computePositionAnimationState();
  }

  constructor(...args: unknown[]);

  constructor() {
    if (this._dir) {
      const changeDetectorRef = inject(ChangeDetectorRef);
      this._dirChangeSubscription = this._dir.change.subscribe((dir: Direction) => {
        this._computePositionAnimationState(dir);
        changeDetectorRef.markForCheck();
      });
    }
  }

  ngOnInit() {
    this._bindTransitionEvents();

    if (this._position === 'center') {
      this._setActiveClass(true);

      // Allows for the dynamic height to animate properly on the initial run.
      afterNextRender(() => this._onCentering.emit(this._elementRef.nativeElement.clientHeight), {
        injector: this._injector,
      });
    }

    this._initialized = true;
  }

  ngOnDestroy() {
    clearTimeout(this._fallbackTimer);
    this._eventCleanups?.forEach(cleanup => cleanup());
    this._dirChangeSubscription.unsubscribe();
  }

  /** Sets up the transition events. */
  private _bindTransitionEvents() {
    this._ngZone.runOutsideAngular(() => {
      const element = this._elementRef.nativeElement;
      const transitionDone = (event: TransitionEvent) => {
        if (event.target === this._contentElement?.nativeElement) {
          this._elementRef.nativeElement.classList.remove('mat-tab-body-animating');

          // Only fire the actual callback when a transition is fully finished,
          // otherwise the content can jump around when the next transition starts.
          if (event.type === 'transitionend') {
            this._transitionDone();
          }
        }
      };

      this._eventCleanups = [
        this._renderer.listen(element, 'transitionstart', (event: TransitionEvent) => {
          if (event.target === this._contentElement?.nativeElement) {
            this._elementRef.nativeElement.classList.add('mat-tab-body-animating');
            this._transitionStarted();
          }
        }),
        this._renderer.listen(element, 'transitionend', transitionDone),
        this._renderer.listen(element, 'transitioncancel', transitionDone),
      ];
    });
  }

  /** Called when a transition has started. */
  private _transitionStarted() {
    clearTimeout(this._fallbackTimer);
    const isCentering = this._position === 'center';
    this._beforeCentering.emit(isCentering);
    if (isCentering) {
      this._onCentering.emit(this._elementRef.nativeElement.clientHeight);
    }
  }

  /** Called when a transition is done. */
  private _transitionDone() {
    if (this._position === 'center') {
      this._onCentered.emit();
    } else if (this._previousPosition === 'center') {
      this._afterLeavingCenter.emit();
    }
  }

  /** Sets the active styling on the tab body based on its current position. */
  _setActiveClass(isActive: boolean) {
    this._elementRef.nativeElement.classList.toggle('mat-mdc-tab-body-active', isActive);
  }

  /** The text direction of the containing app. */
  _getLayoutDirection(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Whether the provided position state is considered center, regardless of origin. */
  _isCenterPosition(): boolean {
    return this._positionIndex === 0;
  }

  /** Computes the position state that will be used for the tab-body animation trigger. */
  private _computePositionAnimationState(dir: Direction = this._getLayoutDirection()) {
    this._previousPosition = this._position;

    if (this._positionIndex < 0) {
      this._position = dir == 'ltr' ? 'left' : 'right';
    } else if (this._positionIndex > 0) {
      this._position = dir == 'ltr' ? 'right' : 'left';
    } else {
      this._position = 'center';
    }

    if (this._animationsDisabled()) {
      this._simulateTransitionEvents();
    } else if (
      this._initialized &&
      (this._position === 'center' || this._previousPosition === 'center')
    ) {
      // The transition events are load-bearing and in some cases they might not fire (e.g.
      // tests setting `* {transition: none}` to disable animations). This timeout will simulate
      // them if a transition doesn't start within a certain amount of time.
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = this._ngZone.runOutsideAngular(() =>
        setTimeout(() => this._simulateTransitionEvents(), 100),
      );
    }
  }

  /** Simulates the body's transition events in an environment where they might not fire. */
  private _simulateTransitionEvents() {
    this._transitionStarted();
    afterNextRender(() => this._transitionDone(), {injector: this._injector});
  }

  /** Whether animations are disabled for the tab group. */
  private _animationsDisabled() {
    return (
      this._animationsModule === 'NoopAnimations' ||
      this.animationDuration === '0ms' ||
      this.animationDuration === '0s'
    );
  }
}
