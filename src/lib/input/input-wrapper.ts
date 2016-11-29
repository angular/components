import {
  Component,
  HostBinding,
  Input,
  Directive,
  AfterContentInit,
  ContentChild,
  SimpleChange,
  ContentChildren,
  ElementRef,
  QueryList,
  OnChanges,
  EventEmitter,
  Output,
  NgModule,
  ModuleWithProviders,
  ViewEncapsulation
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MdError, coerceBooleanProperty} from '../core';
import {Observable} from 'rxjs/Observable';
import {MdTextareaAutosize} from './autosize';


const noop = () => {};


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
  host: {
    '(click)' : 'focus()'
  },
  encapsulation: ViewEncapsulation.None,
})
export class MdInputWrapper implements AfterContentInit, OnChanges {
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
  get empty() { return (this._value == null || this._value === '') && this._inputType !== 'date'; }
  get characterCount(): number {
    return this.empty ? 0 : ('' + this._value).length;
  }

  /**
   * Bindings.
   */
  @Input() align: 'start' | 'end' = 'start';
  @Input() dividerColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() hintLabel: string = '';
  @Input() placeholder: string = null;

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

  private _inputElement: HTMLInputElement | HTMLTextAreaElement;

  get _inputId(): string { return this._inputElement && this._inputElement.id }
  get _inputType(): string { return this._inputElement && this._inputElement.type || 'text' }

  constructor(private _elementRef: ElementRef) {}

  /** Set focus on input */
  focus() {
    this._inputElement && this._inputElement.focus();
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

  /** TODO: internal */
  ngAfterContentInit() {
    this._initInputEl();
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

  private _initInputEl() {
    let inputEls = this._elementRef.nativeElement.querySelectorAll('input, textarea');
    if (inputEls.length != 1) {
      // TODO throw
    }
    this._inputElement = inputEls[0];
    if (MD_INPUT_INVALID_INPUT_TYPE.indexOf(this._inputElement.type || 'text') != -1) {
      throw new MdInputUnsupportedTypeErrorNew(this._inputType);
    }
    this._inputElement.classList.add('md-input-element');
    this._inputElement.id = this._inputElement.id || `md-input-${nextUniqueId++}`;
  }

  /**
   * Convert the value passed in to a value that is expected from the type of the md-input.
   * This is normally performed by the *_VALUE_ACCESSOR in forms, but since the type is bound
   * on our internal input it won't work locally.
   * @private
   */
  private _convertValueForInputType(v: any): any {
    switch (this._inputType) {
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
