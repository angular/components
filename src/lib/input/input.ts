import {
  forwardRef,
  Component,
  HostBinding,
  Input,
  Directive,
  AfterContentInit,
  ContentChild,
  SimpleChange,
  ContentChildren,
  ViewChild,
  ElementRef,
  QueryList,
  OnChanges,
  EventEmitter,
  Output,
  NgModule,
  ModuleWithProviders,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule,
} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {BooleanFieldValue, MatError} from '@angular2-material/core';
import {Observable} from 'rxjs/Observable';


const noop = () => {};

export const MAT_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatInput),
  multi: true
};

// Invalid input type. Using one of these will throw an MatInputUnsupportedTypeError.
const MAT_INPUT_INVALID_INPUT_TYPE = [
  'file',
  'radio',
  'checkbox',
];


let nextUniqueId = 0;


export class MatInputPlaceholderConflictError extends MatError {
  constructor() {
    super('Placeholder attribute and child element were both specified.');
  }
}

export class MatInputUnsupportedTypeError extends MatError {
  constructor(type: string) {
    super(`Input type "${type}" isn't supported by mat-input.`);
  }
}

export class MatInputDuplicatedHintError extends MatError {
  constructor(align: string) {
    super(`A hint was already declared for 'align="${align}"'.`);
  }
}



/**
 * The placeholder directive. The content can declare this to implement more
 * complex placeholders.
 */
@Directive({
  selector: 'mat-placeholder'
})
export class MatPlaceholder {}


/** The hint directive, used to tag content as hint labels (going under the input). */
@Directive({
  selector: 'mat-hint',
  host: {
    '[class.mat-right]': 'align == "end"',
    '[class.mat-hint]': 'true'
  }
})
export class MatHint {
  // Whether to align the hint label at the start or end of the line.
  @Input() align: 'start' | 'end' = 'start';
}


/**
 * Component that represents a text input. It encapsulates the <input> HTMLElement and
 * improve on its behaviour, along with styling it according to the Material Design.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-input',
  templateUrl: 'input.html',
  styleUrls: ['input.css'],
  providers: [MAT_INPUT_CONTROL_VALUE_ACCESSOR],
  host: {'(click)' : 'focus()'}
})
export class MatInput implements ControlValueAccessor, AfterContentInit, OnChanges {
  private _focused: boolean = false;
  private _value: any = '';

  /** Callback registered via registerOnTouched (ControlValueAccessor) */
  private _onTouchedCallback: () => void = noop;
  /** Callback registered via registerOnChange (ControlValueAccessor) */
  private _onChangeCallback: (_: any) => void = noop;

  /**
   * Aria related inputs.
   */
  @Input('aria-label') ariaLabel: string;
  @Input('aria-labelledby') ariaLabelledBy: string;
  @Input('aria-disabled') @BooleanFieldValue() ariaDisabled: boolean;
  @Input('aria-required') @BooleanFieldValue() ariaRequired: boolean;
  @Input('aria-invalid') @BooleanFieldValue() ariaInvalid: boolean;

  /**
   * Content directives.
   */
  @ContentChild(MatPlaceholder) _placeholderChild: MatPlaceholder;
  @ContentChildren(MatHint) _hintChildren: QueryList<MatHint>;

  /** Readonly properties. */
  get focused() { return this._focused; }
  get empty() { return (this._value == null || this._value === '') && this.type !== 'date'; }
  get characterCount(): number {
    return this.empty ? 0 : ('' + this._value).length;
  }
  get inputId(): string { return `${this.id}-input`; }

  /**
   * Bindings.
   */
  @Input() align: 'start' | 'end' = 'start';
  @Input() dividerColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() @BooleanFieldValue() floatingPlaceholder: boolean = true;
  @Input() hintLabel: string = '';

  @Input() autocomplete: string;
  @Input() autocorrect: string;
  @Input() autocapitalize: string;
  @Input() @BooleanFieldValue() autofocus: boolean = false;
  @Input() @BooleanFieldValue() disabled: boolean = false;
  @Input() id: string = `mat-input-${nextUniqueId++}`;
  @Input() list: string = null;
  @Input() max: string | number = null;
  @Input() maxlength: number = null;
  @Input() min: string | number = null;
  @Input() minlength: number = null;
  @Input() placeholder: string = null;
  @Input() @BooleanFieldValue() readonly: boolean = false;
  @Input() @BooleanFieldValue() required: boolean = false;
  @Input() @BooleanFieldValue() spellcheck: boolean = false;
  @Input() step: number = null;
  @Input() tabindex: number = null;
  @Input() type: string = 'text';
  @Input() name: string = null;

  private _blurEmitter: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  private _focusEmitter: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();

  @Output('blur')
  get onBlur(): Observable<FocusEvent> {
    return this._blurEmitter.asObservable();
  }

  @Output('focus')
  get onFocus(): Observable<FocusEvent> {
    return this._focusEmitter.asObservable();
  }

  get value(): any { return this._value; };
  @Input() set value(v: any) {
    v = this._convertValueForInputType(v);
    if (v !== this._value) {
      this._value = v;
      this._onChangeCallback(v);
    }
  }

  // This is to remove the `align` property of the `mat-input` itself. Otherwise HTML5
  // might place it as RTL when we don't want to. We still want to use `align` as an
  // Input though, so we use HostBinding.
  @HostBinding('attr.align') get _align(): any { return null; }


  @ViewChild('input') _inputElement: ElementRef;

  /** Set focus on input */
  focus() {
    this._inputElement.nativeElement.focus();
  }

  _handleFocus(event: FocusEvent) {
    this._focused = true;
    this._focusEmitter.emit(event);
  }

  _handleBlur(event: FocusEvent) {
    this._focused = false;
    this._onTouchedCallback();
    this._blurEmitter.emit(event);
  }

  _handleChange(event: Event) {
    this.value = (<HTMLInputElement>event.target).value;
    this._onTouchedCallback();
  }

  _hasPlaceholder(): boolean {
    return !!this.placeholder || this._placeholderChild != null;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  writeValue(value: any) {
    this._value = value;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnChange(fn: any) {
    this._onChangeCallback = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnTouched(fn: any) {
    this._onTouchedCallback = fn;
  }

  /** TODO: internal */
  ngAfterContentInit() {
    this._validateConstraints();

    // Trigger validation when the hint children change.
    this._hintChildren.changes.subscribe(() => {
      this._validateConstraints();
    });
  }

  /** TODO: internal */
  ngOnChanges(changes: {[key: string]: SimpleChange}) {
    this._validateConstraints();
  }

  /**
   * Convert the value passed in to a value that is expected from the type of the mat-input.
   * This is normally performed by the *_VALUE_ACCESSOR in forms, but since the type is bound
   * on our internal input it won't work locally.
   * @private
   */
  private _convertValueForInputType(v: any): any {
    switch (this.type) {
      case 'number': return parseFloat(v);
      default: return v;
    }
  }

  /**
   * Ensure that all constraints defined by the API are validated, or throw errors otherwise.
   * Constraints for now:
   *   - placeholder attribute and <mat-placeholder> are mutually exclusive.
   *   - type attribute is not one of the forbidden types (see constant at the top).
   *   - Maximum one of each `<mat-hint>` alignment specified, with the attribute being
   *     considered as align="start".
   * @private
   */
  private _validateConstraints() {
    if (this.placeholder != '' && this.placeholder != null && this._placeholderChild != null) {
      throw new MatInputPlaceholderConflictError();
    }
    if (MAT_INPUT_INVALID_INPUT_TYPE.indexOf(this.type) != -1) {
      throw new MatInputUnsupportedTypeError(this.type);
    }

    if (this._hintChildren) {
      // Validate the hint labels.
      let startHint: MatHint = null;
      let endHint: MatHint = null;
      this._hintChildren.forEach((hint: MatHint) => {
        if (hint.align == 'start') {
          if (startHint || this.hintLabel) {
            throw new MatInputDuplicatedHintError('start');
          }
          startHint = hint;
        } else if (hint.align == 'end') {
          if (endHint) {
            throw new MatInputDuplicatedHintError('end');
          }
          endHint = hint;
        }
      });
    }
  }
}


@NgModule({
  declarations: [MatPlaceholder, MatInput, MatHint],
  imports: [CommonModule, FormsModule],
  exports: [MatPlaceholder, MatInput, MatHint],
})
export class MatInputModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MatInputModule,
      providers: []
    };
  }
}
