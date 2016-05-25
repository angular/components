import {
  AfterContentInit,
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Optional,
  Output,
  QueryList,
  ViewEncapsulation,
  forwardRef
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';



var _uniqueIdCounter = 0;

/** A simple change event emitted by either MdButtonToggle or MdButtonToggleGroup. */
export class MdButtonToggleChange {
  source: MdButtonToggle;
  value: any;
}

/** Exclusive selection button toggle group. */
@Directive({
  selector: 'md-button-toggle-group:not([multiple])',
  host: {
    'role': 'radiogroup',
  },
})
export class MdButtonToggleGroup implements AfterContentInit {
  /** The value for the button toggle group. Should match currently selected button toggle. */
  private _value: any = null;

  /** The HTML name attribute applied to toggles in this group. */
  private _name: string = null;

  /** Disables all toggles in the group. */
  private _disabled: boolean = null;

  /** The currently selected button toggle, should match the value. */
  private _selected: MdButtonToggle = null;

  /** Event emitted when the group's value changes. */
  private _change: EventEmitter<MdButtonToggleChange> = new EventEmitter<MdButtonToggleChange>();
  @Output() get change(): Observable<MdButtonToggleChange> {
    return this._change.asObservable();
  }

  /** Child button toggle buttons. */
  @ContentChildren(forwardRef(() => MdButtonToggle))
  private _toggles: QueryList<MdButtonToggle> = null;

  /**
   * Initializes the names once content children are available.
   * This allows us to propagate relevant attributes to associated toggles.
   */
  ngAfterContentInit() {
    if (this.name == null) {
      this.name = `md-button-toggle-group-${_uniqueIdCounter++}`;
    } else {
      this._updateChildToggleNames();
    }
  }

  @Input()
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;

    this._updateChildToggleNames();
  }

  /** Propagate name attribute to toggles. */
  private _updateChildToggleNames(): void {
    if (this._toggles != null) {
      this._toggles.forEach((toggle) => {
        toggle.name = this._name;
      });
    }
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value) {
    this._disabled = (value != null && value !== false) ? true : null;
  }

  @Input()
  get value(): any {
    return this._value;
  }

  set value(newValue: any) {
    if (this._value != newValue) {
      this._value = newValue;

      this._updateSelectedToggleFromValue();
      this._emitChangeEvent();
    }
  }

  private _updateSelectedToggleFromValue(): void {
    let isAlreadySelected = this._selected != null && this._selected.value == this._value;
    if (this._toggles != null && !isAlreadySelected) {
      let matched = this._toggles.filter((toggle) => {
        return toggle.value == this._value;
      });

      if (matched.length == 0) {
        return;
      }

      this.selected = matched[0];
    }
  }

  /** Dispatch change event with current selection and group value. */
  private _emitChangeEvent(): void {
    let event = new MdButtonToggleChange();
    event.source = this._selected;
    event.value = this._value;
    this._change.emit(event);
  }

  @Input()
  get selected() {
    return this._selected;
  }

  set selected(selected: MdButtonToggle) {
    this._selected = selected;
    this.value = selected.value;

    selected.checked = true;
  }
}

/** Multiple selection button-toggle group. */
@Directive({
  selector: 'md-button-toggle-group[multiple]',
})
export class MdButtonToggleGroupMultiple {
  /** Disables all toggles in the group. */
  private _disabled: boolean = null;

  /** Child button toggles. */
  @ContentChildren(forwardRef(() => MdButtonToggle))
  private _toggles: QueryList<MdButtonToggle> = null;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value) {
    this._disabled = (value != null && value !== false) ? true : null;
  }
}

@Component({
  moduleId: module.id,
  selector: 'md-button-toggle',
  templateUrl: 'button-toggle.html',
  styleUrls: ['button-toggle.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdButtonToggle implements OnInit {
  /** Whether or not this button toggle is checked. */
  private _checked: boolean = false;

  /** Type of the button toggle. Either 'radio' or 'checkbox'. */
  private _type: string = null;

  /** The unique ID for this button toggle. */
  @HostBinding('id')
  @Input()
  id: string;

  /** HTML's 'name' attribute used to group radios for unique selection. */
  @Input()
  name: string;

  /** Whether or not this button toggle is disabled. */
  private _disabled: boolean = null;

  /** Value assigned to this button toggle. */
  private _value: any = null;

  /** The parent button toggle group (exclusive selection). Optional. */
  buttonToggleGroup: MdButtonToggleGroup;

  /** The parent button toggle group (multiple selection). Optional. */
  buttonToggleGroupMultiple: MdButtonToggleGroupMultiple;

  /** Event emitted when the group value changes. */
  @Output()
  change: EventEmitter<MdButtonToggleChange> = new EventEmitter<MdButtonToggleChange>();

  constructor(@Optional() toggleGroup: MdButtonToggleGroup,
              @Optional() toggleGroupMultiple: MdButtonToggleGroupMultiple,
              public buttonToggleDispatcher: MdUniqueSelectionDispatcher) {
    this.buttonToggleGroup = toggleGroup;

    this.buttonToggleGroupMultiple = toggleGroupMultiple;

    buttonToggleDispatcher.listen((id: string, name: string) => {
      if (id != this.id && name == this.name) {
        this.checked = false;
      }
    });
  }

  ngOnInit() {
    if (this.id == null) {
      this.id = `md-button-toggle-${_uniqueIdCounter++}`;
    }

    if (this.buttonToggleGroup && this._value == this.buttonToggleGroup.value) {
      this._checked = true;
    }

    // Even if there is no group at all, treat the button toggle as a checkbox so it can be
    // toggled on or off.
    if (this.buttonToggleGroup) {
      this._type = 'radio';
    } else {
      this._type = 'checkbox';
    }
  }

  get inputId(): string {
    return `${this.id}-input`;
  }

  @HostBinding('class.md-button-toggle-checked')
  @Input()
  get checked(): boolean {
    return this._checked;
  }

  set checked(value: boolean) {
    if (value && (this.buttonToggleGroup)) {
      // Notify all button toggles with the same name (in the same group) to un-check.
      this.buttonToggleDispatcher.notify(this.id, this.name);

      if (!this._checked) {
        this._emitChangeEvent();
      }
    }

    this._checked = value;
  }

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
  }

  /** MdButtonToggleGroup reads this to assign its own value. */
  @Input()
  get value(): any {
    return this._value;
  }

  set value(value: any) {
    if (this._value != value) {
      if (this.buttonToggleGroup != null && this.checked) {
        this.buttonToggleGroup.value = value;
      }
      this._value = value;
    }
  }

  /** Dispatch change event with current value. */
  private _emitChangeEvent(): void {
    let event = new MdButtonToggleChange();
    event.source = this;
    event.value = this._value;
    this.change.emit(event);
  }

  @HostBinding('class.md-button-toggle-disabled')
  @Input()
  get disabled(): boolean {
    return this._disabled || (this.buttonToggleGroup != null && this.buttonToggleGroup.disabled) ||
        (this.buttonToggleGroupMultiple != null && this.buttonToggleGroupMultiple.disabled);
  }

  set disabled(value: boolean) {
    this._disabled = (value != null && value !== false) ? true : null;
  }

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (this.buttonToggleGroup != null) {
      // Propagate the change one-way via the group, which will in turn mark this
      // button toggle as checked.
      this.buttonToggleGroup.selected = this;
    } else {
      this._toggle();
    }
  }

  /** Toggle the state of the current button toggle. */
  private _toggle(): void {
    this.checked = !this.checked;
  }
}

export const MD_BUTTON_TOGGLE_DIRECTIVES = [
  MdButtonToggleGroup,
  MdButtonToggleGroupMultiple,
  MdButtonToggle
];
