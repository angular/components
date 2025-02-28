/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkDialogContainer} from '@angular/cdk/dialog';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {
  ANIMATION_MODULE_TYPE,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {CdkPortalOutlet} from '@angular/cdk/portal';

const ENTER_ANIMATION = '_mat-bottom-sheet-enter';
const EXIT_ANIMATION = '_mat-bottom-sheet-exit';

/**
 * Internal component that wraps user-provided bottom sheet content.
 * @docs-private
 */
@Component({
  selector: 'mat-bottom-sheet-container',
  templateUrl: 'bottom-sheet-container.html',
  styleUrl: 'bottom-sheet-container.css',
  // In Ivy embedded views will be change detected from their declaration place, rather than where
  // they were stamped out. This means that we can't have the bottom sheet container be OnPush,
  // because it might cause the sheets that were opened from a template not to be out of date.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'mat-bottom-sheet-container',
    '[class.mat-bottom-sheet-container-animations-enabled]': '!_animationsDisabled',
    '[class.mat-bottom-sheet-container-enter]': '_animationState === "visible"',
    '[class.mat-bottom-sheet-container-exit]': '_animationState === "hidden"',
    'tabindex': '-1',
    '[attr.role]': '_config.role',
    '[attr.aria-modal]': '_config.ariaModal',
    '[attr.aria-label]': '_config.ariaLabel',
    '(animationstart)': '_handleAnimationEvent(true, $event.animationName)',
    '(animationend)': '_handleAnimationEvent(false, $event.animationName)',
    '(animationcancel)': '_handleAnimationEvent(false, $event.animationName)',
  },
  imports: [CdkPortalOutlet],
})
export class MatBottomSheetContainer extends CdkDialogContainer implements OnDestroy {
  private _breakpointSubscription: Subscription;
  protected _animationsDisabled =
    inject(ANIMATION_MODULE_TYPE, {optional: true}) === 'NoopAnimations';

  /** The state of the bottom sheet animations. */
  _animationState: 'void' | 'visible' | 'hidden' = 'void';

  /** Emits whenever the state of the animation changes. */
  _animationStateChanged = new EventEmitter<{
    toState: 'visible' | 'hidden';
    phase: 'start' | 'done';
  }>();

  /** Whether the component has been destroyed. */
  private _destroyed: boolean;

  constructor(...args: unknown[]);

  constructor() {
    super();

    const breakpointObserver = inject(BreakpointObserver);

    this._breakpointSubscription = breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(() => {
        const classList = (this._elementRef.nativeElement as HTMLElement).classList;

        classList.toggle(
          'mat-bottom-sheet-container-medium',
          breakpointObserver.isMatched(Breakpoints.Medium),
        );
        classList.toggle(
          'mat-bottom-sheet-container-large',
          breakpointObserver.isMatched(Breakpoints.Large),
        );
        classList.toggle(
          'mat-bottom-sheet-container-xlarge',
          breakpointObserver.isMatched(Breakpoints.XLarge),
        );
      });
  }

  /** Begin animation of bottom sheet entrance into view. */
  enter(): void {
    if (!this._destroyed) {
      this._animationState = 'visible';
      this._changeDetectorRef.markForCheck();
      this._changeDetectorRef.detectChanges();
      if (this._animationsDisabled) {
        this._simulateAnimation(ENTER_ANIMATION);
      }
    }
  }

  /** Begin animation of the bottom sheet exiting from view. */
  exit(): void {
    if (!this._destroyed) {
      this._elementRef.nativeElement.setAttribute('mat-exit', '');
      this._animationState = 'hidden';
      this._changeDetectorRef.markForCheck();
      if (this._animationsDisabled) {
        this._simulateAnimation(EXIT_ANIMATION);
      }
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._breakpointSubscription.unsubscribe();
    this._destroyed = true;
  }

  private _simulateAnimation(name: typeof ENTER_ANIMATION | typeof EXIT_ANIMATION) {
    this._ngZone.run(() => {
      this._handleAnimationEvent(true, name);
      setTimeout(() => this._handleAnimationEvent(false, name));
    });
  }

  protected _handleAnimationEvent(isStart: boolean, animationName: string) {
    const isEnter = animationName === ENTER_ANIMATION;
    const isExit = animationName === EXIT_ANIMATION;

    if (isEnter || isExit) {
      this._animationStateChanged.emit({
        toState: isEnter ? 'visible' : 'hidden',
        phase: isStart ? 'start' : 'done',
      });
    }
  }
}
