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
  NgModule,
  ModuleWithProviders,
  ViewEncapsulation,
  NgZone
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MdError, coerceBooleanProperty} from '../core';
import {MdTextareaAutosize} from './autosize';


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

  /**
   * Content directives.
   */
  @ContentChild(MdPlaceholderNew) _placeholderChild: MdPlaceholderNew;
  @ContentChildren(MdHintNew) _hintChildren: QueryList<MdHintNew>;

  /** Readonly properties. */
  get focused() { return this._focused; }
  get empty() {
    return (this._inputValue == null || this._inputValue === '') && this._inputType !== 'date';
  }

  /**
   * Bindings.
   */
  @Input() align: 'start' | 'end' = 'start';
  @Input() dividerColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() hintLabel: string = '';

  private _floatingPlaceholder: boolean = true;

  @Input()
  get floatingPlaceholder(): boolean { return this._floatingPlaceholder; }
  set floatingPlaceholder(value) { this._floatingPlaceholder = coerceBooleanProperty(value); }

  // This is to remove the `align` property of the `md-input` itself. Otherwise HTML5
  // might place it as RTL when we don't want to. We still want to use `align` as an
  // Input though, so we use HostBinding.
  @HostBinding('attr.align') get _align(): any { return null; }

  private _inputElement: HTMLInputElement | HTMLTextAreaElement;

  // Do these via DOMMutationObserver
  get _inputId(): string {
    return this._inputElement && this._inputElement.id || '';
  }
  get _inputType(): string {
    return this._inputElement && this._inputElement.type || 'text';
  }
  get _inputPlaceholder(): string {
    return this._inputElement && this._inputElement.placeholder || '';
  }
  get _inputRequired(): boolean {
    return this._inputElement && this._inputElement.required || false;
  }
  get _inputValue(): string {
    return this._inputElement && this._inputElement.value || '';
  }

  constructor(private _elementRef: ElementRef, private _ngZone: NgZone) {}

  /** Set focus on input */
  focus() {
    this._inputElement && this._inputElement.focus();
  }

  _handleFocus() {
    this._focused = true;
  }

  _handleBlur() {
    this._focused = false;
  }

  _hasPlaceholder(): boolean {
    return !!this._inputPlaceholder || this._placeholderChild != null;
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
    // TODO(mmalerba): Revalidate when type changes.
    if (MD_INPUT_INVALID_INPUT_TYPE.indexOf(this._inputElement.type || 'text') != -1) {
      throw new MdInputUnsupportedTypeErrorNew(this._inputType);
    }
    // TODO(mmalerba): Revalidate when placeholder changes.
    if (this._inputElement.placeholder && this._placeholderChild != null) {
      throw new MdInputPlaceholderConflictErrorNew();
    }

    this._inputElement.classList.add('md-input-element');
    this._inputElement.id = this._inputElement.id || `md-input-${nextUniqueId++}`;
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
