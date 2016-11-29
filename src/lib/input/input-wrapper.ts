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
  ViewEncapsulation
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MdError, coerceBooleanProperty} from '../core';
import {Observable} from 'rxjs/Observable';
import {MdTextareaAutosize} from './autosize';


const noop = () => {};


export const MD_INPUT_CONTROL_VALUE_ACCESSOR_NEW: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdInputWrapper),
  multi: true
};

// Invalid input type. Using one of these will throw an MdInputUnsupportedTypeErrorNew.
const MD_INPUT_INVALID_INPUT_TYPE = [
  'file',
  'radio',
  'checkbox',
];


let nextUniqueId = 0;


export class MdInputPlaceholderConflictErrorNew extends MdError {
  constructor() {
    super('Placeholder attribute and child element were both specified.');
  }
}

export class MdInputUnsupportedTypeErrorNew extends MdError {
  constructor(type: string) {
    super(`Input type "${type}" isn't supported by md-input.`);
  }
}

export class MdInputDuplicatedHintErrorNew extends MdError {
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
export class MdPlaceholderNew {}


/** The hint directive, used to tag content as hint labels (going under the input). */
@Directive({
  selector: 'md-hint',
  host: {
    '[class.md-right]': 'align == "end"',
    '[class.md-hint]': 'true'
  }
})
export class MdHintNew {
  // Whether to align the hint label at the start or end of the line.
  @Input() align: 'start' | 'end' = 'start';
}

/**
 * Component that represents a text input. It encapsulates the <input> HTMLElement and
 * improve on its behaviour, along with styling it according to the Material Design.
 */
@Component({
  moduleId: module.id,
  selector: 'md-input-wrapper',
  templateUrl: 'input-wrapper.html',
  styleUrls: ['input-wrapper.css'],
  providers: [MD_INPUT_CONTROL_VALUE_ACCESSOR_NEW],
  host: {
    '(click)' : 'focus()'
  },
  encapsulation: ViewEncapsulation.None,
})
export class MdInputWrapper implements ControlValueAccessor, AfterContentInit, OnChanges {
  private _focused: boolean = false;
  private _value: any = '';

  /** Callback registered via registerOnTouched (ControlValueAccessor) */
  private _onTouchedCallback: () => void = noop;
  /** Callback registered via registerOnChange (ControlValueAccessor) */
  private _onChangeCallback: (_: any) => void = noop;

  /**
   * Content directives.
   */
  @ContentChild(MdPlaceholderNew) _placeholderChild: MdPlaceholderNew;
  @ContentChildren(MdHintNew) _hintChildren: QueryList<MdHintNew>;

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
  @Input() hintLabel: string = '';

  @Input() id: string = `md-input-${nextUniqueId++}`;
  @Input() placeholder: string = null;
  @Input() type: string = 'text';

  private _floatingPlaceholder: boolean = true;

  @Input()
  get floatingPlaceholder(): boolean { return this._floatingPlaceholder; }
  set floatingPlaceholder(value) { this._floatingPlaceholder = coerceBooleanProperty(value); }

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

  // This is to remove the `align` property of the `md-input` itself. Otherwise HTML5
  // might place it as RTL when we don't want to. We still want to use `align` as an
  // Input though, so we use HostBinding.
  @HostBinding('attr.align') get _align(): any { return null; }


  @ViewChild('input') _inputElement: ElementRef;

  _elementType: 'input' | 'textarea';

  constructor(elementRef: ElementRef) {
    // Set the element type depending on normalized selector used(md-input / md-textarea)
    this._elementType = elementRef.nativeElement.nodeName.toLowerCase() === 'md-input' ?
        'input' :
        'textarea';
  }

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
   * Convert the value passed in to a value that is expected from the type of the md-input.
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
   *   - placeholder attribute and <md-placeholder> are mutually exclusive.
   *   - type attribute is not one of the forbidden types (see constant at the top).
   *   - Maximum one of each `<md-hint>` alignment specified, with the attribute being
   *     considered as align="start".
   * @private
   */
  private _validateConstraints() {
    if (this.placeholder != '' && this.placeholder != null && this._placeholderChild != null) {
      throw new MdInputPlaceholderConflictErrorNew();
    }
    if (MD_INPUT_INVALID_INPUT_TYPE.indexOf(this.type) != -1) {
      throw new MdInputUnsupportedTypeErrorNew(this.type);
    }

    if (this._hintChildren) {
      // Validate the hint labels.
      let startHint: MdHintNew = null;
      let endHint: MdHintNew = null;
      this._hintChildren.forEach((hint: MdHintNew) => {
        if (hint.align == 'start') {
          if (startHint || this.hintLabel) {
            throw new MdInputDuplicatedHintErrorNew('start');
          }
          startHint = hint;
        } else if (hint.align == 'end') {
          if (endHint) {
            throw new MdInputDuplicatedHintErrorNew('end');
          }
          endHint = hint;
        }
      });
    }
  }
}


@NgModule({
  declarations: [MdPlaceholderNew, MdInputWrapper, MdHintNew, MdTextareaAutosize],
  imports: [CommonModule, FormsModule],
  exports: [MdPlaceholderNew, MdInputWrapper, MdHintNew, MdTextareaAutosize],
})
export class MdInputWrapperModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdInputWrapperModule,
      providers: []
    };
  }
}
