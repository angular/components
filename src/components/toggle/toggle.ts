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
import {MdToggleDispatcher} from './toggle_dispatcher';
import {Observable} from 'rxjs/Observable';


export {MdToggleDispatcher} from './toggle_dispatcher';



var _uniqueIdCounter = 0;

/** A simple change event emitted by either MdToggle or MdToggleGroup. */
export class MdToggleChange {
  source: MdToggle;
  value: any;
}

/** Exclusive selection toggle group. */
@Directive({
  selector: 'md-toggle-group:not([multiple])',
  host: {
    'role': 'radiogroup',
  },
})
export class MdToggleGroup implements AfterContentInit {
  /** The value for the toggle group. Should match currently selected toggle. */
  private _value: any = null;

  /** The HTML name attribute applied to toggles in this group. */
  private _name: string = null;

  /** Disables all toggles in the group. */
  private _disabled: boolean = null;

  /** The currently selected toggle, should match the value. */
  private _selected: MdToggle = null;

  /** Event emitted when the group's value changes. */
  private _change: EventEmitter<MdToggleChange> = new EventEmitter<MdToggleChange>();
  @Output() get change(): Observable<MdToggleChange> {
    return this._change.asObservable();
  }

  /** Child toggle buttons. */
  @ContentChildren(forwardRef(() => MdToggle))
  private _toggles: QueryList<MdToggle> = null;

  /**
   * Initializes the names once content children are available.
   * This allows us to propagate relevant attributes to associated toggles.
   */
  ngAfterContentInit() {
    if (this.name == null) {
      this.name = `md-toggle-group-${_uniqueIdCounter++}`;
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
    let event = new MdToggleChange();
    event.source = this._selected;
    event.value = this._value;
    this._change.emit(event);
  }

  @Input()
  get selected() {
    return this._selected;
  }

  set selected(selected: MdToggle) {
    this._selected = selected;
    this.value = selected.value;

    selected.checked = true;
  }
}

/** Multiple selection toggle group. */
@Directive({
  selector: 'md-toggle-group[multiple]',
})
export class MdToggleGroupMultiple {
  /** Disables all toggles in the group. */
  private _disabled: boolean = null;

  /** Child toggle buttons. */
  @ContentChildren(forwardRef(() => MdToggle))
  private _toggles: QueryList<MdToggle> = null;

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
  selector: 'md-toggle',
  templateUrl: 'toggle.html',
  styleUrls: ['toggle.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdToggle implements OnInit {
  /** Whether or not this toggle is checked. */
  private _checked: boolean = false;

  /** Type of the toggle. Either 'radio' or 'checkbox'. */
  private _type: string = null;

  /** The unique ID for this toggle. */
  @HostBinding('id')
  @Input()
  id: string;

  /** HTML's 'name' attribute used to group radios for unique selection. */
  @Input()
  name: string;

  /** Whether or not this toggle is disabled. */
  private _disabled: boolean = null;

  /** Value assigned to this toggle. */
  private _value: any = null;

  /** The parent toggle group (exclusive selection). Optional. */
  toggleGroup: MdToggleGroup;

  /** The parent toggle group (multiple selection). Optional. */
  toggleGroupMultiple: MdToggleGroupMultiple;

  /** Event emitted when the group value changes. */
  @Output()
  change: EventEmitter<MdToggleChange> = new EventEmitter<MdToggleChange>();

  constructor(@Optional() toggleGroup: MdToggleGroup,
              @Optional() toggleGroupMultiple: MdToggleGroupMultiple,
              public toggleDispatcher: MdToggleDispatcher) {
    this.toggleGroup = toggleGroup;

    this.toggleGroupMultiple = toggleGroupMultiple;

    toggleDispatcher.listen((name: string) => {
      if (name == this.name) {
        this.checked = false;
      }
    });
  }

  ngOnInit() {
    if (this.id == null) {
      this.id = `md-toggle-${_uniqueIdCounter++}`;
    }

    if (this.toggleGroup && this._value == this.toggleGroup.value) {
      this._checked = true;
    }

    // Even if there is no group at all, treat the toggle as a checkbox so it can be
    // toggled on or off.
    if (this.toggleGroup) {
      this._type = 'radio';
    } else {
      this._type = 'checkbox';
    }
  }

  get inputId(): string {
    return `${this.id}-input`;
  }

  @HostBinding('class.md-toggle-checked')
  @Input()
  get checked(): boolean {
    return this._checked;
  }

  set checked(value: boolean) {
    if (value && (this.toggleGroup)) {
      // Notify all toggles with the same name (in the same group) to un-check.
      this.toggleDispatcher.notify(this.name);

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

  /** MdToggleGroup reads this to assign its own value. */
  @Input()
  get value(): any {
    return this._value;
  }

  set value(value: any) {
    if (this._value != value) {
      if (this.toggleGroup != null && this.checked) {
        this.toggleGroup.value = value;
      }
      this._value = value;
    }
  }

  /** Dispatch change event with current value. */
  private _emitChangeEvent(): void {
    let event = new MdToggleChange();
    event.source = this;
    event.value = this._value;
    this.change.emit(event);
  }

  @HostBinding('class.md-toggle-disabled')
  @Input()
  get disabled(): boolean {
    return this._disabled || (this.toggleGroup != null && this.toggleGroup.disabled) ||
        (this.toggleGroupMultiple != null && this.toggleGroupMultiple.disabled);
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

    if (this.toggleGroup != null) {
      // Propagate the change one-way via the group, which will in turn mark this
      // toggle as checked.
      this.toggleGroup.selected = this;
    } else {
      this._toggle();
    }
  }

  /** Toggle the state of the current toggle. */
  private _toggle(): void {
    this.checked = !this.checked;
  }
}

export const MD_TOGGLE_DIRECTIVES = [MdToggleGroup, MdToggleGroupMultiple, MdToggle];
