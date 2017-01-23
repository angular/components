import {
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    Renderer,
    EventEmitter,
    Input,
    OnInit,
    Optional,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation,
    forwardRef,
    AfterContentInit,
    OnDestroy,
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {coerceBooleanProperty, SelectionModel} from '../core';
import {MdButtonToggleGroupNonArrayValueError} from './button-toggle-errors';
import 'rxjs/add/observable/merge';


/**
 * Provider Expression that allows md-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MD_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdButtonToggleGroup),
  multi: true
};

let _uniqueIdCounter = 0;

/** Change event object emitted by MdButtonToggleGroup. */
export class MdButtonToggleGroupChange {
  constructor(public source: MdButtonToggleGroup, public value: any|any[]) { }
}

/** Change event object emitted by MdButtonToggle. */
export class MdButtonToggleChange {
  constructor(public source: MdButtonToggle, public value: any, public isUserInput = false) { }
}

/** Exclusive selection button toggle group that behaves like a radio-button group. */
@Directive({
  selector: 'md-button-toggle-group, mat-button-toggle-group',
  providers: [MD_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR],
  host: {
    'role': 'radiogroup',
    '[class.md-button-toggle-vertical]': 'vertical'
  },
  exportAs: 'mdButtonToggleGroup',
})
export class MdButtonToggleGroup implements AfterContentInit, OnDestroy, ControlValueAccessor {
  /** The HTML name attribute applied to toggles in this group. */
  private _name: string = `md-button-toggle-group-${_uniqueIdCounter++}`;

  /** Disables all toggles in the group. */
  private _disabled: boolean = null;

  /** Whether the button toggle group should be vertical. */
  private _vertical: boolean = false;

  /** Whether the user should be allowed to select multiple items. */
  private _multiple: boolean = false;

  /** Keeps track of the selected values. */
  private _model: SelectionModel<MdButtonToggle>;

  /** Subscription to selected state changes of the child toggles. */
  private _changeSubscription: Subscription;

  /** Subscription to changes in the list of toggles. */
  private _toggleSubscription: Subscription;

  /** Subscription to changes in the SelectionModel. */
  private _modelSubscription: Subscription;

  /** Used for storing any value that is being set before the component has been initialized. */
  private _tempValue: any;

  /**
   * The method to be called in order to update ngModel.
   * Now `ngModel` binding is not supported in multiple selection mode.
   */
  private _controlValueAccessorChangeFn = (value: any) => {};

  /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
  onTouched = () => {};

  /** Event emitted when the group's value changes. */
  private _change = new EventEmitter<MdButtonToggleGroupChange>();
  @Output() get change(): Observable<MdButtonToggleGroupChange> {
    return this._change.asObservable();
  }

  /** Child button toggle buttons. */
  @ContentChildren(forwardRef(() => MdButtonToggle))
  _toggles: QueryList<MdButtonToggle> = null;

  ngAfterContentInit(): void {
    this._model = new SelectionModel<MdButtonToggle>(this.multiple,
        this._tempValue ? [].concat(this._tempValue) : null);

    if (this._tempValue) {
      this._selectByValue(this._tempValue);
    }

    // Listen to changes in child toggles and re-subscribe when toggles are adde/removed.
    this._subscribeToToggleChanges();
    this._toggleSubscription = this._toggles.changes.subscribe(() => {
      this._subscribeToToggleChanges();
    });

    // Sync changes to the SelectionModel with the value accessor.
    this._modelSubscription = this._model.onChange.subscribe(() => {
      this._controlValueAccessorChangeFn(this.value);
    });
  }

  ngOnDestroy(): void {
    this._dropChangeSubscription();
    this._toggleSubscription.unsubscribe();
    this._modelSubscription.unsubscribe();
  }

  /** `name` attribute for the underlying `input` element. */
  @Input()
  get name(): string { return this._name; }
  set name(value: string) {
    this._name = value;
    this._updateButtonToggleNames();
  }

  /** Whether the toggle group is disabled. */
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value) { this._disabled = coerceBooleanProperty(value); }

  /** Whether the toggle group is vertical. */
  @Input()
  get vertical(): boolean { return this._vertical; }
  set vertical(value) { this._vertical = coerceBooleanProperty(value); }

  /** Whether the toggle group is disabled. */
  @Input()
  get multiple(): boolean { return this._multiple; }
  set multiple(value) { this._multiple = coerceBooleanProperty(value); }

  /** The selected value in the input group. */
  get selected(): MdButtonToggle|MdButtonToggle[] {
    return this.multiple ? this._model.selected : this._model.selected[0];
  }

  /** Value of the toggle group. */
  @Input()
  get value(): any {
    if (this._model && !this._model.isEmpty()) {
      return Array.isArray(this.selected) ?
        this.selected.map(toggle => toggle.value) :
        this.selected.value;
    }
  }

  set value(newValue: any|any[]) {
    if (this._model) {
      this._selectByValue(newValue);
    } else {
      this._tempValue = newValue;
    }
  }

  /** Syncs the `name` attribute of the child toggles with the `name` of the group. */
  private _updateButtonToggleNames(): void {
    if (this._toggles) {
      this._toggles.forEach(toggle => toggle.name = this._name);
    }
  }

  /** Unsubscribes from the change listener on the child toggles. */
  private _dropChangeSubscription(): void {
    if (this._changeSubscription) {
      this._changeSubscription.unsubscribe();
      this._changeSubscription = null;
    }
  }

  /** Subscribes to user-generated changes of the button toggles. */
  private _subscribeToToggleChanges(): void {
    let source = Observable.merge.apply(Observable, this._toggles.map(toggle => toggle.change));

    this._dropChangeSubscription();
    this._changeSubscription = source.subscribe((event: MdButtonToggleChange) => {
      let toggleButton = (button: MdButtonToggle, isSelected: boolean) => {
        if (isSelected) {
          this._model.select(button);
        } else {
          this._model.deselect(button);
        }

        button._setChecked(isSelected);
      };

      if (this.multiple) {
        toggleButton(event.source, event.source.checked);
      } else {
        this._model.clear();
        this._toggles.forEach(button => toggleButton(button, button === event.source));
      }

      if (event.isUserInput) {
        this._change.emit(new MdButtonToggleGroupChange(this, this.value));
        this.onTouched();
      }
    });
  }

  /** Sets the selected button toggles based on a value. */
  private _selectByValue(newValue: any|any[]) {
    if (this.multiple && newValue && !Array.isArray(newValue)) {
      throw new MdButtonToggleGroupNonArrayValueError();
    }

    let select = (value: any) => {
      let correspondingToggle = this._toggles.find(toggle => toggle.value === value);

      if (correspondingToggle && !this._model.isSelected(correspondingToggle)) {
        correspondingToggle._setChecked(true);
        this._model.select(correspondingToggle);
      }
    };

    this._model.clear();

    if (this.multiple) {
      newValue.forEach((current: any) => select(current));
    } else {
      this._toggles.forEach(toggle => toggle._setChecked(false));
      select(newValue);
    }
  }

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value Value to be set to the model.
   */
  writeValue(value: any) {
    this.value = value;
  }

  /**
   * Registers a callback that will be triggered when the value has changed.
   * Implemented as part of ControlValueAccessor.
   * @param fn On change callback function.
   */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Registers a callback that will be triggered when the control has been touched.
   * Implemented as part of ControlValueAccessor.
   * @param fn On touch callback function.
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /**
   * Toggles the disabled state of the component. Implemented as part of ControlValueAccessor.
   * @param isDisabled Whether the component should be disabled.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

/** Single button inside of a toggle group. */
@Component({
  moduleId: module.id,
  selector: 'md-button-toggle',
  templateUrl: 'button-toggle.html',
  styleUrls: ['button-toggle.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.md-button-toggle-checked]': 'checked',
    '[class.md-button-toggle-disabled]': 'disabled',
    '[attr.id]': 'id',
  }
})
export class MdButtonToggle implements OnInit {
  /** The unique ID for this button toggle. */
  @Input() id: string;

  /** HTML's 'name' attribute used to group radios for unique selection. */
  @Input() name: string;

  /** Whether the toggle is checked. */
  @Input()
  get checked(): boolean { return this._checked; }
  set checked(value: boolean) {
    if (value !== this._checked) {
      this._checked = !!value;
      this._change.emit(new MdButtonToggleChange(this, this.value));
    }
  }

  /** Value assigned to this button toggle. */
  @Input() value: any = null;

  /** Whether the button is disabled. */
  @Input()
  get disabled(): boolean { return this._disabled || (this._group && this._group.disabled); }
  set disabled(value) { this._disabled = coerceBooleanProperty(value); }

  /** The underlying input element, responsible for selecting and deselecting. */
  @ViewChild('input') _inputElement: ElementRef;

  /** Type of the button toggle. Either 'radio' or 'checkbox'. */
  _type: 'checkbox' | 'radio';

  /** Unique ID for the underlying input element. */
  _inputId: string = '';

  /** Whether the toggle is checked. */
  private _checked: boolean = false;

  /** Whether or not this button toggle is disabled. */
  private _disabled: boolean = null;

  /** Whether or not the button toggle is allowed to be deselected. */
  private _canBeDeselected: boolean = false;

  /** Event emitted when the group value changes. */
  private _change: EventEmitter<MdButtonToggleChange> = new EventEmitter<MdButtonToggleChange>();

  @Output() get change(): Observable<MdButtonToggleChange> {
    return this._change.asObservable();
  }

  constructor(@Optional() private _group: MdButtonToggleGroup, private _renderer: Renderer) { }

  ngOnInit() {
    this.id = this.id || `md-button-toggle-${_uniqueIdCounter++}`;
    this._inputId = `${this.id}-input`;
    this._canBeDeselected = !this._group || this._group.multiple;
    this._type = this._canBeDeselected ? 'checkbox' : 'radio';

    if (this._group) {
      this.name = this._group.name;
    }
  }

  /** Focuses the button. */
  focus() {
    this._renderer.invokeElementMethod(this._inputElement.nativeElement, 'focus');
  }

  /** Checks the button toggle due to an interaction with the underlying native input. */
  _onInputChange(event: Event) {
    event.stopPropagation();
    this._checked = this._canBeDeselected ? !this.checked : true;
    this._change.emit(new MdButtonToggleChange(this, this.value, true));
  }

  _onInputClick(event: Event) {
    // We have to stop propagation for click events on the visual hidden input element.
    // By default, when a user clicks on a label element, a generated click event will be
    // dispatched on the associated input element. Since we are using a label element as our
    // root container, the click event on the `slide-toggle` will be executed twice.
    // The real click event will bubble up, and the generated click event also tries to bubble up.
    // This will lead to multiple click events.
    // Preventing bubbling for the second event will solve that issue.
    event.stopPropagation();
  }

  /**
   * Allows for setting the checked state without emitting a change event.
   * Useful for resetting the checked state from the group.
   * @param value Whether the toggle should be selected.
   */
  _setChecked(value: boolean) {
    this._checked = value;
  }
}
