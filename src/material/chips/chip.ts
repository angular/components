/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FocusMonitor, _IdGenerator} from '@angular/cdk/a11y';
import {BACKSPACE, DELETE} from '@angular/cdk/keycodes';
import {_CdkPrivateStyleLoader, _VisuallyHiddenLoader} from '@angular/cdk/private';
import {DOCUMENT} from '@angular/common';
import {
  ANIMATION_MODULE_TYPE,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  DoCheck,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  inject,
} from '@angular/core';
import {
  MAT_RIPPLE_GLOBAL_OPTIONS,
  MatRippleLoader,
  RippleGlobalOptions,
  _StructuralStylesLoader,
} from '@angular/material/core';
import {Subject, Subscription, merge} from 'rxjs';
import {MatChipAction} from './chip-action';
import {MatChipAvatar, MatChipRemove, MatChipTrailingIcon} from './chip-icons';
import {MAT_CHIP, MAT_CHIP_AVATAR, MAT_CHIP_REMOVE, MAT_CHIP_TRAILING_ICON} from './tokens';

/** Represents an event fired on an individual `mat-chip`. */
export interface MatChipEvent {
  /** The chip the event was fired on. */
  chip: MatChip;
}

/**
 * Material design styled Chip base component. Used inside the MatChipSet component.
 *
 * Extended by MatChipOption and MatChipRow for different interaction patterns.
 */
@Component({
  selector: 'mat-basic-chip, [mat-basic-chip], mat-chip, [mat-chip]',
  exportAs: 'matChip',
  templateUrl: 'chip.html',
  styleUrl: 'chip.css',
  host: {
    'class': 'mat-mdc-chip',
    '[class]': '"mat-" + (color || "primary")',
    '[class.mdc-evolution-chip]': '!_isBasicChip',
    '[class.mdc-evolution-chip--disabled]': 'disabled',
    '[class.mdc-evolution-chip--with-trailing-action]': '_hasTrailingIcon()',
    '[class.mdc-evolution-chip--with-primary-graphic]': 'leadingIcon',
    '[class.mdc-evolution-chip--with-primary-icon]': 'leadingIcon',
    '[class.mdc-evolution-chip--with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-basic-chip]': '_isBasicChip',
    '[class.mat-mdc-standard-chip]': '!_isBasicChip',
    '[class.mat-mdc-chip-with-trailing-icon]': '_hasTrailingIcon()',
    '[class._mat-animation-noopable]': '_animationsDisabled',
    '[id]': 'id',
    '[attr.role]': 'role',
    '[attr.aria-label]': 'ariaLabel',
    '(keydown)': '_handleKeydown($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: MAT_CHIP, useExisting: MatChip}],
  imports: [MatChipAction],
})
export class MatChip implements OnInit, AfterViewInit, AfterContentInit, DoCheck, OnDestroy {
  _changeDetectorRef = inject(ChangeDetectorRef);
  _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected _ngZone = inject(NgZone);
  private _focusMonitor = inject(FocusMonitor);
  private _globalRippleOptions = inject<RippleGlobalOptions>(MAT_RIPPLE_GLOBAL_OPTIONS, {
    optional: true,
  });

  protected _document = inject(DOCUMENT);

  /** Emits when the chip is focused. */
  readonly _onFocus = new Subject<MatChipEvent>();

  /** Emits when the chip is blurred. */
  readonly _onBlur = new Subject<MatChipEvent>();

  /** Whether this chip is a basic (unstyled) chip. */
  _isBasicChip: boolean;

  /** Role for the root of the chip. */
  @Input() role: string | null = null;

  /** Whether the chip has focus. */
  private _hasFocusInternal = false;

  /** Whether moving focus into the chip is pending. */
  private _pendingFocus: boolean;

  /** Subscription to changes in the chip's actions. */
  private _actionChanges: Subscription | undefined;

  /** Whether animations for the chip are enabled. */
  _animationsDisabled: boolean;

  /** All avatars present in the chip. */
  @ContentChildren(MAT_CHIP_AVATAR, {descendants: true})
  protected _allLeadingIcons: QueryList<MatChipAvatar>;

  /** All trailing icons present in the chip. */
  @ContentChildren(MAT_CHIP_TRAILING_ICON, {descendants: true})
  protected _allTrailingIcons: QueryList<MatChipTrailingIcon>;

  /** All remove icons present in the chip. */
  @ContentChildren(MAT_CHIP_REMOVE, {descendants: true})
  protected _allRemoveIcons: QueryList<MatChipRemove>;

  _hasFocus() {
    return this._hasFocusInternal;
  }

  /** A unique id for the chip. If none is supplied, it will be auto-generated. */
  @Input() id: string = inject(_IdGenerator).getId('mat-mdc-chip-');

  // TODO(#26104): Consider deprecating and using `_computeAriaAccessibleName` instead.
  // `ariaLabel` may be unnecessary, and `_computeAriaAccessibleName` only supports
  // datepicker's use case.
  /** ARIA label for the content of the chip. */
  @Input('aria-label') ariaLabel: string | null = null;

  // TODO(#26104): Consider deprecating and using `_computeAriaAccessibleName` instead.
  // `ariaDescription` may be unnecessary, and `_computeAriaAccessibleName` only supports
  // datepicker's use case.
  /** ARIA description for the content of the chip. */
  @Input('aria-description') ariaDescription: string | null = null;

  /** Id of a span that contains this chip's aria description. */
  _ariaDescriptionId = `${this.id}-aria-description`;

  /** Whether the chip list is disabled. */
  _chipListDisabled: boolean = false;

  private _textElement!: HTMLElement;

  /**
   * The value of the chip. Defaults to the content inside
   * the `mat-mdc-chip-action-label` element.
   */
  @Input()
  get value(): any {
    return this._value !== undefined ? this._value : this._textElement.textContent!.trim();
  }
  set value(value: any) {
    this._value = value;
  }
  protected _value: any;

  // TODO: should be typed as `ThemePalette` but internal apps pass in arbitrary strings.
  /**
   * Theme color of the chip. This API is supported in M2 themes only, it has no
   * effect in M3 themes. For color customization in M3, see https://material.angular.io/components/chips/styling.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-color-variants
   */
  @Input() color?: string | null;

  /**
   * Determines whether or not the chip displays the remove styling and emits (removed) events.
   */
  @Input({transform: booleanAttribute})
  removable: boolean = true;

  /**
   * Colors the chip for emphasis as if it were selected.
   */
  @Input({transform: booleanAttribute})
  highlighted: boolean = false;

  /** Whether the ripple effect is disabled or not. */
  @Input({transform: booleanAttribute})
  disableRipple: boolean = false;

  /** Whether the chip is disabled. */
  @Input({transform: booleanAttribute})
  get disabled(): boolean {
    return this._disabled || this._chipListDisabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled = false;

  /** Emitted when a chip is to be removed. */
  @Output() readonly removed: EventEmitter<MatChipEvent> = new EventEmitter<MatChipEvent>();

  /** Emitted when the chip is destroyed. */
  @Output() readonly destroyed: EventEmitter<MatChipEvent> = new EventEmitter<MatChipEvent>();

  /** The unstyled chip selector for this component. */
  protected basicChipAttrName = 'mat-basic-chip';

  /** The chip's leading icon. */
  @ContentChild(MAT_CHIP_AVATAR) leadingIcon: MatChipAvatar;

  /** The chip's trailing icon. */
  @ContentChild(MAT_CHIP_TRAILING_ICON) trailingIcon: MatChipTrailingIcon;

  /** The chip's trailing remove icon. */
  @ContentChild(MAT_CHIP_REMOVE) removeIcon: MatChipRemove;

  /** Action receiving the primary set of user interactions. */
  @ViewChild(MatChipAction) primaryAction: MatChipAction;

  /**
   * Handles the lazy creation of the MatChip ripple.
   * Used to improve initial load time of large applications.
   */
  private _rippleLoader: MatRippleLoader = inject(MatRippleLoader);

  protected _injector = inject(Injector);

  constructor(...args: unknown[]);

  constructor() {
    inject(_CdkPrivateStyleLoader).load(_StructuralStylesLoader);
    inject(_CdkPrivateStyleLoader).load(_VisuallyHiddenLoader);
    const animationMode = inject(ANIMATION_MODULE_TYPE, {optional: true});
    this._animationsDisabled = animationMode === 'NoopAnimations';
    this._monitorFocus();

    this._rippleLoader?.configureRipple(this._elementRef.nativeElement, {
      className: 'mat-mdc-chip-ripple',
      disabled: this._isRippleDisabled(),
    });
  }

  ngOnInit() {
    // This check needs to happen in `ngOnInit` so the overridden value of
    // `basicChipAttrName` coming from base classes can be picked up.
    const element = this._elementRef.nativeElement;
    this._isBasicChip =
      element.hasAttribute(this.basicChipAttrName) ||
      element.tagName.toLowerCase() === this.basicChipAttrName;
  }

  ngAfterViewInit() {
    this._textElement = this._elementRef.nativeElement.querySelector('.mat-mdc-chip-action-label')!;

    if (this._pendingFocus) {
      this._pendingFocus = false;
      this.focus();
    }
  }

  ngAfterContentInit(): void {
    // Since the styling depends on the presence of some
    // actions, we have to mark for check on changes.
    this._actionChanges = merge(
      this._allLeadingIcons.changes,
      this._allTrailingIcons.changes,
      this._allRemoveIcons.changes,
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }

  ngDoCheck(): void {
    this._rippleLoader.setDisabled(this._elementRef.nativeElement, this._isRippleDisabled());
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef);
    this._rippleLoader?.destroyRipple(this._elementRef.nativeElement);
    this._actionChanges?.unsubscribe();
    this.destroyed.emit({chip: this});
    this.destroyed.complete();
  }

  /**
   * Allows for programmatic removal of the chip.
   *
   * Informs any listeners of the removal request. Does not remove the chip from the DOM.
   */
  remove(): void {
    if (this.removable) {
      this.removed.emit({chip: this});
    }
  }

  /** Whether or not the ripple should be disabled. */
  _isRippleDisabled(): boolean {
    return (
      this.disabled ||
      this.disableRipple ||
      this._animationsDisabled ||
      this._isBasicChip ||
      !!this._globalRippleOptions?.disabled
    );
  }

  /** Returns whether the chip has a trailing icon. */
  _hasTrailingIcon() {
    return !!(this.trailingIcon || this.removeIcon);
  }

  /** Handles keyboard events on the chip. */
  _handleKeydown(event: KeyboardEvent) {
    // Ignore backspace events where the user is holding down the key
    // so that we don't accidentally remove too many chips.
    if ((event.keyCode === BACKSPACE && !event.repeat) || event.keyCode === DELETE) {
      event.preventDefault();
      this.remove();
    }
  }

  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    if (!this.disabled) {
      // If `focus` is called before `ngAfterViewInit`, we won't have access to the primary action.
      // This can happen if the consumer tries to focus a chip immediately after it is added.
      // Queue the method to be called again on init.
      if (this.primaryAction) {
        this.primaryAction.focus();
      } else {
        this._pendingFocus = true;
      }
    }
  }

  /** Gets the action that contains a specific target node. */
  _getSourceAction(target: Node): MatChipAction | undefined {
    return this._getActions().find(action => {
      const element = action._elementRef.nativeElement;
      return element === target || element.contains(target);
    });
  }

  /** Gets all of the actions within the chip. */
  _getActions(): MatChipAction[] {
    const result: MatChipAction[] = [];

    if (this.primaryAction) {
      result.push(this.primaryAction);
    }

    if (this.removeIcon) {
      result.push(this.removeIcon);
    }

    if (this.trailingIcon) {
      result.push(this.trailingIcon);
    }

    return result;
  }

  /** Handles interactions with the primary action of the chip. */
  _handlePrimaryActionInteraction() {
    // Empty here, but is overwritten in child classes.
  }

  /** Starts the focus monitoring process on the chip. */
  private _monitorFocus() {
    this._focusMonitor.monitor(this._elementRef, true).subscribe(origin => {
      const hasFocus = origin !== null;

      if (hasFocus !== this._hasFocusInternal) {
        this._hasFocusInternal = hasFocus;

        if (hasFocus) {
          this._onFocus.next({chip: this});
        } else {
          // When animations are enabled, Angular may end up removing the chip from the DOM a little
          // earlier than usual, causing it to be blurred and throwing off the logic in the chip list
          // that moves focus to the next item. To work around the issue, we defer marking the chip
          // as not focused until after the next render.
          this._changeDetectorRef.markForCheck();
          setTimeout(() => this._ngZone.run(() => this._onBlur.next({chip: this})));
        }
      }
    });
  }
}
