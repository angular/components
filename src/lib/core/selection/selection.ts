import {Subject} from 'rxjs/Subject';


/**
 * Class to be used to power selecting one or more options from a list.
 * @docs-private
 */
export class MdSelectionModel {
  constructor(
    private _options: any[],
    private _isMulti = false,
    initiallySelectedValues?: any[]) {

    if (initiallySelectedValues && initiallySelectedValues.length) {
      if (_isMulti) {
        initiallySelectedValues.forEach(value => this._select(value));
      } else {
        this._select(initiallySelectedValues[0]);
      }

      // Clear the array in order to avoid firing the change event for preselected values.
      this._unflushedSelectedValues.length = 0;
    }
  }

  /** Event emitted when the value has changed. */
  onChange: Subject<MdSelectionChange> = new Subject();

  /** Currently-selected values. */
  private _selectedValues: any[] = [];

  /** Keeps track of the deselected options that haven't been emitted by the change event. */
  private _unflushedDeselectedValues: any[] = [];

  /** Keeps track of the selected option that haven't been emitted by the change event. */
  private _unflushedSelectedValues: any[] = [];

  /** List of available available options. */
  get options(): any[] { return this._options.slice(); }
  set options(newOptions: any[]) {
    this._options = newOptions.slice();

    // Remove any options that are no longer a part of the options and skip throwing an error.
    // Uses a reverse while, because it's modifying the array that it is iterating.
    let i = this._selectedValues.length;

    while (i--) {
      if (this._options.indexOf(this._selectedValues[i]) === -1) {
        this._deselect(this._selectedValues[i]);
      }
    }

    this._flushChangeEvent();
  }

  /** Selected value(s). */
  get selected(): any[] {
    return this._selectedValues.slice();
  }

  /**
   * Selects a value.
   */
  select(value: any): void {
    this._verifyExistence(value);

    if (!this._isMulti && !this.isEmpty()) {
      this._deselect(this._selectedValues[0]);
    }

    this._select(value);
    this._flushChangeEvent();
  }

  /**
   * Deselects a value.
   */
  deselect(value: any): void {
    this._verifyExistence(value);
    this._deselect(value);
    this._flushChangeEvent();
  }

  /**
   * Determines whether a value is selected.
   */
  isSelected(value: any): boolean {
    return this._selectedValues.indexOf(value) > -1;
  }

  /**
   * Determines whether the model has a value.
   */
  isEmpty(): boolean {
    return this._selectedValues.length === 0;
  }

  /**
   * Selects all of the options. Only applicable when the model is in multi-selection mode.
   */
  selectAll(): void {
    if (!this._isMulti) {
      throw new Error('selectAll is only allowed in multi-selection mode');
    }

    this._options.forEach(option => this._select(option));
    this._flushChangeEvent();
  }

  /**
   * Clears all of the selected values.
   */
  clear(): void {
    if (!this.isEmpty()) {
      let i = this._selectedValues.length;

      // Use a reverse while, because we're modifying the array that we're iterating.
      while (i--) {
        this._deselect(this._selectedValues[i]);
      }

      this._flushChangeEvent();
    }
  }

  /** Emits a change event and clears the records of selected and deselected values. */
  private _flushChangeEvent() {
    if (this._unflushedSelectedValues.length || this._unflushedDeselectedValues.length) {
      let event = new MdSelectionChange(this._unflushedSelectedValues,
          this._unflushedDeselectedValues);

      this.onChange.next(event);
      this._unflushedDeselectedValues = [];
      this._unflushedSelectedValues = [];
    }
  }

  /** Selects a value. */
  private _select(value: any) {
    if (!this.isSelected(value)) {
      this._selectedValues.push(value);
      this._unflushedSelectedValues.push(value);
    }
  }

  /** Deselects a value. */
  private _deselect(value: any) {
    if (this.isSelected(value)) {
      this._selectedValues.splice(this._selectedValues.indexOf(value), 1);
      this._unflushedDeselectedValues.push(value);
    }
  }

  /** Throws an error if a value isn't a part of the list of options. */
  private _verifyExistence(value: any): void {
    if (this._options.indexOf(value) === -1) {
      throw new Error('Attempting to manipulate an option that is not part of the option list.');
    }
  }
}

/**
 * Describes an event emitted when the value of a MdSelectionModel has changed.
 * @docs-private
 */
export class MdSelectionChange {
  constructor(public added?: any, public removed?: any) { }
}
