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
  ModuleWithProviders
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule,
} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {BooleanFieldValue} from '@angular2-material/core/annotations/field-value';
import {MdError} from '@angular2-material/core/errors/error';
import {Observable} from 'rxjs/Observable';

const noop = () => { };

export const MD_TEXTAREA_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdTextarea),
  multi: true
};

let nextUniqueId = 0;

export class MdTextareaPlaceholderConflictError extends MdError {
  constructor() {
    super('Placeholder attribute and child element were both specified.');
  }
}

export class MdTextareaDuplicatedHintError extends MdError {
  constructor(align: string) {
    super(`A hint was already declared for 'align="${align}"'.`);
  }
}

/**
 * The placeholder directive. The content can declare this to implement more
 * complex placeholders.
 */
@Directive({
  selector: 'md-placeholder'
})
export class MdPlaceholder { }

/** The hint directive, used to tag content as hint labels (going under the textarea). */
@Directive({
  selector: 'md-hint',
  host: {
    '[class.md-right]': 'align == "end"',
    '[class.md-hint]': 'true'
  }
})
export class MdHint {
  // Whether to align the hint label at the start or end of the line.
  @Input() align: 'start' | 'end' = 'start';
}

/**
 * Component that represents a text textarea. It encapsulates the <textarea> HTMLElement and
 * improve on its behaviour, along with styling it according to the Material Design.
 */
@Component({
  moduleId: module.id,
  selector: 'md-textarea',
  templateUrl: 'textarea.html',
  styleUrls: ['textarea.css'],
  providers: [MD_TEXTAREA_CONTROL_VALUE_ACCESSOR],
  host: { '(click)': 'focus()' }
})
export class MdTextarea implements ControlValueAccessor, AfterContentInit, OnChanges {
  private _focused: boolean = false;
  private _value: any = '';

  /** Callback registered via registerOnTouched (ControlValueAccessor) */
  private _onTouchedCallback: () => void = noop;
  /** Callback registered via registerOnChange (ControlValueAccessor) */
  private _onChangeCallback: (_: any) => void = noop;

  /**
   * Aria related textareas.
   */
  @Input('aria-label') ariaLabel: string;
  @Input('aria-labelledby') ariaLabelledBy: string;
  @Input('aria-disabled') @BooleanFieldValue() ariaDisabled: boolean;
  @Input('aria-required') @BooleanFieldValue() ariaRequired: boolean;
  @Input('aria-invalid') @BooleanFieldValue() ariaInvalid: boolean;

  /**
   * Content directives.
   */
  @ContentChild(MdPlaceholder) _placeholderChild: MdPlaceholder;
  @ContentChildren(MdHint) _hintChildren: QueryList<MdHint>;

  /** Readonly properties. */
  get focused() { return this._focused; }
  get empty() { return this._value == null || this._value === ''; }
  get characterCount(): number {
    return this.empty ? 0 : ('' + this._value).length;
  }
  get textareaId(): string { return `${this.id}-textarea`; }

  /**
   * Bindings.
   */
  @Input() align: 'start' | 'end' = 'start';
  @Input() dividerColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() @BooleanFieldValue() floatingPlaceholder: boolean = true;
  @Input() hintLabel: string = '';
  @Input() @BooleanFieldValue() autofocus: boolean = false;
  @Input() @BooleanFieldValue() disabled: boolean = false;
  @Input() id: string = `md-textarea-${nextUniqueId++}`;
  @Input() maxlength: number = null;
  @Input() placeholder: string = null;
  @Input() @BooleanFieldValue() readonly: boolean = false;
  @Input() @BooleanFieldValue() required: boolean = false;
  @Input() tabindex: number = null;
  @Input() name: string = null;
  @Input() rows: number = 3;
  @Input() cols: number = null;

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
    if (v !== this._value) {
      this._value = v;
      this._onChangeCallback(v);
    }
  }

  // This is to remove the `align` property of the `md-textarea` itself. Otherwise HTML5
  // might place it as RTL when we don't want to. We still want to use `align` as an
  // Input though, so we use HostBinding.
  @HostBinding('attr.align') get _align(): any { return null; }

  @ViewChild('textarea') _inputElement: ElementRef;

  /** Set focus on textarea */
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
  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    this._validateConstraints();
  }

  /**
   * Ensure that all constraints defined by the API are validated, or throw errors otherwise.
   * Constraints for now:
   *   - placeholder attribute and <md-placeholder> are mutually exclusive.
   *   - Maximum one of each `<md-hint>` alignment specified, with the attribute being
   *     considered as align="start".
   * @private
   */
  private _validateConstraints() {
    if (this.placeholder != '' && this.placeholder != null && this._placeholderChild != null) {
      throw new MdTextareaPlaceholderConflictError();
    }

    if (this._hintChildren) {
      // Validate the hint labels.
      let startHint: MdHint = null;
      let endHint: MdHint = null;
      this._hintChildren.forEach((hint: MdHint) => {
        if (hint.align == 'start') {
          if (startHint || this.hintLabel) {
            throw new MdTextareaDuplicatedHintError('start');
          }
          startHint = hint;
        } else if (hint.align == 'end') {
          if (endHint) {
            throw new MdTextareaDuplicatedHintError('end');
          }
          endHint = hint;
        }
      });
    }
  }
}

@NgModule({
  declarations: [MdPlaceholder, MdTextarea, MdHint],
  imports: [CommonModule, FormsModule],
  exports: [MdPlaceholder, MdTextarea, MdHint],
})
export class MdTextareaModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdTextareaModule,
      providers: []
    };
  }
}
