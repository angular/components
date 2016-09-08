import {
    NgModule,
    ModuleWithProviders,
    ContentChild,
    Directive,
    Component,
    Input,
    Output,
    ViewChildren,
    NgZone,
    EventEmitter,
    QueryList,
    ContentChildren
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PortalModule} from '@angular2-material/core';
import {MatTabLabel} from './tab-label';
import {MatTabContent} from './tab-content';
import {MatTabLabelWrapper} from './tab-label-wrapper';
import {MatInkBar} from './ink-bar';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {RIGHT_ARROW, LEFT_ARROW, ENTER} from '@angular2-material/core';

/** Used to generate unique ID's for each tab component */
let nextId = 0;

/** A simple change event emitted on focus or selection changes. */
export class MatTabChangeEvent {
  index: number;
  tab: MatTab;
}

@Directive({
  selector: 'mat-tab'
})
export class MatTab {
  @ContentChild(MatTabLabel) label: MatTabLabel;
  @ContentChild(MatTabContent) content: MatTabContent;

  // TODO: Replace this when BooleanFieldValue is removed.
  private _disabled = false;
  @Input('disabled')
  set disabled(value: boolean) {
    this._disabled = (value != null && `${value}` !== 'false');
  }
  get disabled(): boolean {
    return this._disabled;
  }
}

/**
 * Material design tab-group component.  Supports basic tab pairs (label + content) and includes
 * animated ink-bar, keyboard navigation, and screen reader.
 * See: https://www.google.com/design/spec/components/tabs.html
 */
@Component({
  moduleId: module.id,
  selector: 'mat-tab-group',
  templateUrl: 'tab-group.html',
  styleUrls: ['tab-group.css'],
})
export class MatTabGroup {
  @ContentChildren(MatTab) _tabs: QueryList<MatTab>;

  @ViewChildren(MatTabLabelWrapper) _labelWrappers: QueryList<MatTabLabelWrapper>;
  @ViewChildren(MatInkBar) _inkBar: QueryList<MatInkBar>;

  private _isInitialized: boolean = false;

  private _selectedIndex: number = 0;
  @Input()
  set selectedIndex(value: number) {
    if (value != this._selectedIndex && this.isValidIndex(value)) {
      this._selectedIndex = value;

      if (this._isInitialized) {
        this._onSelectChange.emit(this._createChangeEvent(value));
      }
    }
  }
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  /**
   * Determines if an index is valid.  If the tabs are not ready yet, we assume that the user is
   * providing a valid index and return true.
   */
  isValidIndex(index: number): boolean {
    if (this._tabs) {
      const tab = this._tabs.toArray()[index];
      return tab && !tab.disabled;
    } else {
      return true;
    }
  }

  /** Output to enable support for two-way binding on `selectedIndex`. */
  @Output('selectedIndexChange') private get _selectedIndexChange(): Observable<number> {
    return this.selectChange.map(event => event.index);
  }

  private _onFocusChange: EventEmitter<MatTabChangeEvent> = new EventEmitter<MatTabChangeEvent>();
  @Output('focusChange') get focusChange(): Observable<MatTabChangeEvent> {
    return this._onFocusChange.asObservable();
  }

  private _onSelectChange: EventEmitter<MatTabChangeEvent> = new EventEmitter<MatTabChangeEvent>();
  @Output('selectChange') get selectChange(): Observable<MatTabChangeEvent> {
    return this._onSelectChange.asObservable();
  }

  private _focusIndex: number = 0;
  private _groupId: number;

  constructor(private _zone: NgZone) {
    this._groupId = nextId++;
  }

  /**
   * Waits one frame for the view to update, then upates the ink bar
   * Note: This must be run outside of the zone or it will create an infinite change detection loop
   * TODO: internal
   */
  ngAfterViewChecked(): void {
    this._zone.runOutsideAngular(() => {
      window.requestAnimationFrame(() => {
        this._updateInkBar();
      });
    });
    this._isInitialized = true;
  }

  /** Tells the ink-bar to align itself to the current label wrapper */
  private _updateInkBar(): void {
    this._inkBar.toArray()[0].alignToElement(this._currentLabelWrapper);
  }

  /**
   * Reference to the current label wrapper; defaults to null for initial render before the
   * ViewChildren references are ready.
   */
  private get _currentLabelWrapper(): HTMLElement {
    return this._labelWrappers && this._labelWrappers.length
        ? this._labelWrappers.toArray()[this.selectedIndex].elementRef.nativeElement
        : null;
  }

  /** Tracks which element has focus; used for keyboard navigation */
  get focusIndex(): number {
    return this._focusIndex;
  }

  /** When the focus index is set, we must manually send focus to the correct label */
  set focusIndex(value: number) {
    if (this.isValidIndex(value)) {
      this._focusIndex = value;

      if (this._isInitialized) {
        this._onFocusChange.emit(this._createChangeEvent(value));
      }

      if (this._labelWrappers && this._labelWrappers.length) {
        this._labelWrappers.toArray()[value].focus();
      }
    }
  }

  private _createChangeEvent(index: number): MatTabChangeEvent {
    const event = new MatTabChangeEvent;
    event.index = index;
    if (this._tabs && this._tabs.length) {
      event.tab = this._tabs.toArray()[index];
    }
    return event;
  }

  /** Returns a unique id for each tab label element */
  _getTabLabelId(i: number): string {
    return `mat-tab-label-${this._groupId}-${i}`;
  }

  /** Returns a unique id for each tab content element */
  _getTabContentId(i: number): string {
    return `mat-tab-content-${this._groupId}-${i}`;
  }

  handleKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case RIGHT_ARROW:
        this.focusNextTab();
        break;
      case LEFT_ARROW:
        this.focusPreviousTab();
        break;
      case ENTER:
        this.selectedIndex = this.focusIndex;
        break;
    }
  }

  /**
   * Moves the focus left or right depending on the offset provided.  Valid offsets are 1 and -1.
   */
  moveFocus(offset: number) {
    if (this._labelWrappers) {
      const tabs: MatTab[] = this._tabs.toArray();
      for (let i = this.focusIndex + offset; i < tabs.length && i >= 0; i += offset) {
        if (this.isValidIndex(i)) {
          this.focusIndex = i;
          return;
        }
      }
    }
  }

  /** Increment the focus index by 1 until a valid tab is found. */
  focusNextTab(): void {
    this.moveFocus(1);
  }

  /** Decrement the focus index by 1 until a valid tab is found. */
  focusPreviousTab(): void {
    this.moveFocus(-1);
  }
}


@NgModule({
  imports: [CommonModule, PortalModule],
  // Don't export MatInkBar or MatTabLabelWrapper, as they are internal implementatino details.
  exports: [MatTabGroup, MatTabLabel, MatTabContent, MatTab],
  declarations: [MatTabGroup, MatTabLabel, MatTabContent, MatTab, MatInkBar, MatTabLabelWrapper],
})
export class MatTabsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MatTabsModule,
      providers: []
    };
  }
}
