/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  numberAttribute,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  inject,
  HostAttributeToken,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import {_IdGenerator, FocusMonitor} from '@angular/cdk/a11y';
import {
  MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS,
  MatSlideToggleDefaultOptions,
} from './slide-toggle-config';
import {
  _animationsDisabled,
  _MatInternalFormField,
  _StructuralStylesLoader,
  MatRipple,
} from '../core';
import {_CdkPrivateStyleLoader} from '@angular/cdk/private';

/** Change event object emitted by a slide toggle. */
export class MatSlideToggleChange {
  constructor(
    /** The source slide toggle of the event. */
    public source: MatSlideToggle,
    /** The new `checked` value of the slide toggle. */
    public checked: boolean,
  ) {}
}

@Component({
  selector: 'mat-slide-toggle',
  templateUrl: 'slide-toggle.html',
  styleUrl: 'slide-toggle.css',
  host: {
    'class': 'mat-mdc-slide-toggle',
    '[id]': 'id',
    // Needs to be removed since it causes some a11y issues (see #21266).
    '[attr.tabindex]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.name]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[class.mat-mdc-slide-toggle-focused]': '_focused',
    '[class.mat-mdc-slide-toggle-checked]': 'checked',
    '[class._mat-animation-noopable]': '_noopAnimations',
    '[class]': 'color ? "mat-" + color : ""',
  },
  exportAs: 'matSlideToggle',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatSlideToggle),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: MatSlideToggle,
      multi: true,
    },
  ],
  imports: [MatRipple, _MatInternalFormField],
})
export class MatSlideToggle
  implements OnDestroy, AfterContentInit, OnChanges, ControlValueAccessor, Validator
{
  private _elementRef = inject(ElementRef);
  protected _focusMonitor = inject(FocusMonitor);
  protected _changeDetectorRef = inject(ChangeDetectorRef);
  defaults = inject<MatSlideToggleDefaultOptions>(MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS);

  private _onChange = (_: any) => {};
  private _onTouched = () => {};
  private _validatorOnChange = () => {};

  private _uniqueId: string;
  private _checked: boolean = false;

  private _createChangeEvent(isChecked: boolean) {
    return new MatSlideToggleChange(this, isChecked);
  }

  /** Unique ID for the label element. */
  _labelId: string;

  /** Returns the unique id for the visual hidden button. */
  get buttonId(): string {
    return `${this.id || this._uniqueId}-button`;
  }

  /** Reference to the MDC switch element. */
  @ViewChild('switch') _switchElement: ElementRef<HTMLElement>;

  /** Focuses the slide-toggle. */
  focus(): void {
    this._switchElement.nativeElement.focus();
  }
  /** Whether noop animations are enabled. */
  _noopAnimations = _animationsDisabled();

  /** Whether the slide toggle is currently focused. */
  _focused: boolean;

  /** Name value will be applied to the input element if present. */
  @Input() name: string | null = null;

  /** A unique id for the slide-toggle input. If none is supplied, it will be auto-generated. */
  @Input() id: string;

  /** Whether the label should appear after or before the slide-toggle. Defaults to 'after'. */
  @Input() labelPosition: 'before' | 'after' = 'after';

  /** Used to set the aria-label attribute on the underlying input element. */
  @Input('aria-label') ariaLabel: string | null = null;

  /** Used to set the aria-labelledby attribute on the underlying input element. */
  @Input('aria-labelledby') ariaLabelledby: string | null = null;

  /** Used to set the aria-describedby attribute on the underlying input element. */
  @Input('aria-describedby') ariaDescribedby: string;

  /** Whether the slide-toggle is required. */
  @Input({transform: booleanAttribute}) required: boolean;

  // TODO(crisbeto): this should be a ThemePalette, but some internal apps were abusing
  // the lack of type checking previously and assigning random strings.
  /**
   * Theme color of the slide toggle. This API is supported in M2 themes only,
   * it has no effect in M3 themes. For color customization in M3, see https://material.angular.io/components/slide-toggle/styling.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-color-variants
   */
  @Input() color: string | undefined;

  /** Whether the slide toggle is disabled. */
  @Input({transform: booleanAttribute}) disabled: boolean = false;

  /** Whether the slide toggle has a ripple. */
  @Input({transform: booleanAttribute}) disableRipple: boolean = false;

  /** Tabindex of slide toggle. */
  @Input({transform: (value: unknown) => (value == null ? 0 : numberAttribute(value))})
  tabIndex: number = 0;

  /** Whether the slide-toggle element is checked or not. */
  @Input({transform: booleanAttribute})
  get checked(): boolean {
    return this._checked;
  }
  set checked(value: boolean) {
    this._checked = value;
    this._changeDetectorRef.markForCheck();
  }

  /** Whether to hide the icon inside of the slide toggle. */
  @Input({transform: booleanAttribute}) hideIcon: boolean;

  /** Whether the slide toggle should remain interactive when it is disabled. */
  @Input({transform: booleanAttribute}) disabledInteractive: boolean;

  /** An event will be dispatched each time the slide-toggle changes its value. */
  @Output() readonly change = new EventEmitter<MatSlideToggleChange>();

  /**
   * An event will be dispatched each time the slide-toggle input is toggled.
   * This event is always emitted when the user toggles the slide toggle, but this does not mean
   * the slide toggle's value has changed.
   */
  @Output() readonly toggleChange: EventEmitter<void> = new EventEmitter<void>();

  /** Returns the unique id for the visual hidden input. */
  get inputId(): string {
    return `${this.id || this._uniqueId}-input`;
  }

  constructor(...args: unknown[]);

  constructor() {
    inject(_CdkPrivateStyleLoader).load(_StructuralStylesLoader);
    const tabIndex = inject(new HostAttributeToken('tabindex'), {optional: true});
    const defaults = this.defaults;

    this.tabIndex = tabIndex == null ? 0 : parseInt(tabIndex) || 0;
    this.color = defaults.color || 'accent';
    this.id = this._uniqueId = inject(_IdGenerator).getId('mat-mdc-slide-toggle-');
    this.hideIcon = defaults.hideIcon ?? false;
    this.disabledInteractive = defaults.disabledInteractive ?? false;
    this._labelId = this._uniqueId + '-label';
  }

  ngAfterContentInit() {
    this._focusMonitor.monitor(this._elementRef, true).subscribe(focusOrigin => {
      if (focusOrigin === 'keyboard' || focusOrigin === 'program') {
        this._focused = true;
        this._changeDetectorRef.markForCheck();
      } else if (!focusOrigin) {
        // When a focused element becomes disabled, the browser *immediately* fires a blur event.
        // Angular does not expect events to be raised during change detection, so any state
        // change (such as a form control's ng-touched) will cause a changed-after-checked error.
        // See https://github.com/angular/angular/issues/17793. To work around this, we defer
        // telling the form control it has been touched until the next tick.
        Promise.resolve().then(() => {
          this._focused = false;
          this._onTouched();
          this._changeDetectorRef.markForCheck();
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['required']) {
      this._validatorOnChange();
    }
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  /** Implemented as part of ControlValueAccessor. */
  writeValue(value: any): void {
    this.checked = !!value;
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  /** Implemented as a part of Validator. */
  validate(control: AbstractControl<boolean>): ValidationErrors | null {
    return this.required && control.value !== true ? {'required': true} : null;
  }

  /** Implemented as a part of Validator. */
  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn;
  }

  /** Implemented as a part of ControlValueAccessor. */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._changeDetectorRef.markForCheck();
  }

  /** Toggles the checked state of the slide-toggle. */
  toggle(): void {
    this.checked = !this.checked;
    this._onChange(this.checked);
  }

  /**
   * Emits a change event on the `change` output. Also notifies the FormControl about the change.
   */
  protected _emitChangeEvent() {
    this._onChange(this.checked);
    this.change.emit(this._createChangeEvent(this.checked));
  }

  /** Method being called whenever the underlying button is clicked. */
  _handleClick() {
    if (!this.disabled) {
      this.toggleChange.emit();

      if (!this.defaults.disableToggleValue) {
        this.checked = !this.checked;
        this._onChange(this.checked);
        this.change.emit(new MatSlideToggleChange(this, this.checked));
      }
    }
  }

  _getAriaLabelledBy() {
    if (this.ariaLabelledby) {
      return this.ariaLabelledby;
    }

    // Even though we have a `label` element with a `for` pointing to the button, we need the
    // `aria-labelledby`, because the button gets flagged as not having a label by tools like axe.
    return this.ariaLabel ? null : this._labelId;
  }
}
