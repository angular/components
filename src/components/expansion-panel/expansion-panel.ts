import {
  Component,
  Directive,
  ContentChildren,
  QueryList,
  ViewEncapsulation,
  Renderer,
  ElementRef,
  ViewChild,
  OnDestroy,
  Input,
  HostBinding,
  Output,
  EventEmitter
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {BooleanFieldValue} from '@angular2-material/core/annotations/field-value';
import {MdIcon, MdIconRegistry} from '@angular2-material/icon/icon';
import {MD_RIPPLE_DIRECTIVES} from '@angular2-material/core/core';
//import {TAB, ENTER} from '@angular2-material/core/keyboard/keycodes';

/** A simple change event emitted on expansion or focus the panel. */
export class MdExpansionPanelChangeEvent {
    expansionPanel: MdExpansionPanel;
    index: number;
}

@Component({
  moduleId: module.id,
  selector: 'md-expansion-panel',
  templateUrl: 'expansion-panel.html',
  styleUrls: ['expansion-panel.css'],
  directives: [MD_RIPPLE_DIRECTIVES, MdIcon],
  providers: [MdIconRegistry],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(focus)': '_handleFocus()',
    '(blur)': '_handleBlur()'
  }
})
export class MdExpansionPanel implements OnDestroy {
  @ViewChild('header') _headerContainer: ElementRef;
  @ViewChild('content') _contentContainer: ElementRef;

  /** Whether or not the panel is expanded. */
  @HostBinding('class.md-expanded')
  @Input('md-expanded')
  @BooleanFieldValue() expanded: boolean = false;

  /** Whether or not the panel is disabled. */
  @HostBinding('class.md-disabled')
  @Input('md-disabled')
  @BooleanFieldValue() disabled: boolean = false;

  /** Tab index attribute of DOM element, necessary for tab navigation */
  @HostBinding('attr.tabIndex')
  get tabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  private _onExpandedChange = new EventEmitter<MdExpansionPanelChangeEvent>();
  @Output('expandedChange')
  get expandedChange(): Observable<MdExpansionPanelChangeEvent> {
    return this._onExpandedChange.asObservable();
  }

  private _onFocusedChange = new EventEmitter<MdExpansionPanelChangeEvent>();
  @Output('focusedChange')
  get focusedChange(): Observable<MdExpansionPanelChangeEvent> {
    return this._onFocusedChange.asObservable();
  }

  /** Index of the panel within the group. Set from group directive. */
  private _index: number = 0;
  set index(value: number) {
      this._index = value;
  }

  /** Whether or not the panel has the focus */
  private _focused: boolean = false;
  get focused(): boolean {
    return this._focused;
  }

  /** Handler of the click on the header container. Used to remove click event. */
  private _headerContainerClickHandler: Function;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer) { }

  ngAfterViewInit() {
    this._headerContainerClickHandler = this._renderer.listen(
        this._headerContainer.nativeElement, 'click',
        this._handleHeaderContainerClick.bind(this));

    this._updateContainerHeight();
  }

  ngOnDestroy() {
    this._headerContainerClickHandler();
  }

  /** Perform focus on DOM element */
  focus(): void {
    this._renderer.invokeElementMethod(this._elementRef.nativeElement, 'focus');
  }

  /** Expand the panel content */
  expand(): void {
    this._toggle(true);
  }

  /** Collapse the panel content */
  collapse(): void {
    this._toggle(false);
  }

  /** Handle the click event on the header container that has the function of expand or collapse */
  private _handleHeaderContainerClick(): void {
    this._toggle();
  }

  /** Handle the focus event on the panel */
  private _handleFocus(): void {
    this._focused = true;
    this._onFocusedChange.emit(this._createChangeEvent());
  }

  /** Handle the blur event on the panel */
  private _handleBlur(): void {
    this._focused = false;
    this._onFocusedChange.emit(this._createChangeEvent());
  }

  /** Expand or collapse the content. Forced to the requested state if present. */
  private _toggle(forceExpanded?: boolean) {
    let newExpanded: boolean;

    if (forceExpanded != null) {
        newExpanded = forceExpanded;
    } else {
        newExpanded = !this.expanded;
    }

    if (newExpanded != this.expanded && !this.disabled) {
      this.expanded = newExpanded;
      this._updateContainerHeight();
      this._onExpandedChange.emit(this._createChangeEvent());
    }
  }

  /** Update the height of the content container DOM element */
  private _updateContainerHeight(): void {
    let contentHeight = 0;

    if (this.expanded) {
      const contentElements = this._contentContainer.nativeElement.childNodes;
      for (let contentElement of contentElements) {
        contentHeight += contentElement.offsetHeight || 0;
      }
    }

    const tabIndexElements = this._contentContainer.nativeElement.querySelectorAll(
        'a, button, input, textarea, select');

    for (let tabIndexElement of tabIndexElements) {
      this._renderer.setElementAttribute(tabIndexElement, 'tabindex', this.expanded ? '0' : '-1');
    }

    this._renderer.setElementStyle(
      this._contentContainer.nativeElement, 'height',
      `${contentHeight}px`);
  }

  /** Returns the custom event for expansion or focus event */
  private _createChangeEvent(): MdExpansionPanelChangeEvent {
    const event = new MdExpansionPanelChangeEvent;
    event.expansionPanel = this;
    event.index = this._index;

    return event;
  }
}

@Directive({
  selector: 'md-expansion-panel-group',
  host: { '(keydown)': '_handleKeydown($event)' }
})
export class MdExpansionPanelGroup implements OnDestroy {
  /** Query list of expansion panel that are being rendered. */
  @ContentChildren(MdExpansionPanel) _expansionPanels: QueryList<MdExpansionPanel>;

  /** Whether or not the group allows multiple panel expanded */
  @Input('md-multiple-expansions')
  @BooleanFieldValue() multipleExpansions: boolean = false;

  /**
   * List of subscription to the changes of the property 'expanded'
   * of each expansion panel in the group
   */
  private _expandedChangeSubscriptions = new Array<Subscription>();
  /**
   * List of subscription to the changes of the property 'focused'
   * of each expansion panel in the group
   */
  private _focusedChangeSubscriptions = new Array<Subscription>();

  /** Current panel that has the focus */
  private _focusedPanelIndex: number = 0;

  ngAfterViewInit() {
    this._setupComponent();

    this._expansionPanels.changes.subscribe(() => {
      this._setupComponent();
    });
  }

  ngOnDestroy() {
    this._unsubscribeExpandedChanges();
    this._unsubscribeFocusedChanges();
  }

  /** Setup panel event subscriptions and index of each panel in this group */
  private _setupComponent(): void {
    const expansionPanels = this._expansionPanels.toArray();

    // Index of each panel is set here because only the group has the list of panel
    for (let index = 0; index < expansionPanels.length; index++) {
      expansionPanels[index].index = index;
    }

    this._unsubscribeExpandedChanges();
    this._unsubscribeFocusedChanges();
    this._subscribeExpandedChanges(expansionPanels);
    this._subscribeFocusedChanges(expansionPanels);
  }

  private _handleKeydown(event: KeyboardEvent): void {
    // TODO Change when keycode const are available in @angular2-material/core
    if (event.keyCode === 13 || event.keyCode === 9) {
      const expansionPanels = this._expansionPanels.toArray();

      // ENTER
      if (event.keyCode === 13) {
        expansionPanels[this._focusedPanelIndex].expand();
      }
      // TAB
      else if (event.keyCode === 9) {
        // In an expanded panel the user can navigate through input or button elements with TAB key
        if (!expansionPanels[this._focusedPanelIndex].expanded) {
          let nextPanelIndex = this._getNextPanelIndex(event.shiftKey ? -1 : 1);

          if (nextPanelIndex != null) {
            event.preventDefault();
            expansionPanels[nextPanelIndex].focus();
          }
        }
      }
    }
  }

  /** Returns the next panel index not disabled */
  private _getNextPanelIndex(delta: number): number {
    const nextPanelIndex = this._focusedPanelIndex + delta;
    const expansionPanels = this._expansionPanels.toArray();

    if (nextPanelIndex < 0 || nextPanelIndex >= expansionPanels.length) {
      // Out of range
      return null;
    } else if (expansionPanels[nextPanelIndex].disabled) {
      // Disabled, skip all disabled panel recursively
      const nextDelta = delta >= 0 ? delta + 1 : delta - 1;
      return this._getNextPanelIndex(nextDelta);
    } else {
      return nextPanelIndex;
    }
  }

  /** Collapse all panel in the group except the panel at the index passed */
  private _collapseExpansionPanels(ignoreAtIndex: number): void {
    const expansionPanels = this._expansionPanels.toArray();

    for (let index = 0; index < expansionPanels.length; index++) {
      if (index == ignoreAtIndex) {
        continue;
      }

      expansionPanels[index].collapse();
    }
  }

  /** Subscribe to the changes of the 'expanded' property of each panel */
  private _subscribeExpandedChanges(expansionPanels: Array<MdExpansionPanel>): void {
    for (let index = 0; index < expansionPanels.length; index++) {
      const expansionPanel = expansionPanels[index];

      const subscription = expansionPanel.expandedChange.subscribe(event => {
        if (!this.multipleExpansions && event.expansionPanel.expanded) {
          this._collapseExpansionPanels(index);
        }
      });

      this._expandedChangeSubscriptions.push(subscription);
    }
  }

  /** Remove the subscription to the changes of the 'expanded' property of each panel */
  private _unsubscribeExpandedChanges(): void {
    for (let unsubscribeExpandedChange of this._expandedChangeSubscriptions) {
        unsubscribeExpandedChange.unsubscribe();
    }

    this._expandedChangeSubscriptions = new Array();
  }

  /** Subscribe to the changes of the 'expanded' property of each panel */
  private _subscribeFocusedChanges(expansionPanels: Array<MdExpansionPanel>): void {
    for (let index = 0; index < expansionPanels.length; index++) {
      const expansionPanel = expansionPanels[index];

      const subscription = expansionPanel.focusedChange.subscribe(event => {
        if (event.expansionPanel.focused) {
          this._focusedPanelIndex = index;
        }
      });

      this._focusedChangeSubscriptions.push(subscription);
    }
  }

  /** Remove the subscription to the changes of the 'focused' property of each panel */
  private _unsubscribeFocusedChanges(): void {
    for (let unsubscribeFocusedChange of this._focusedChangeSubscriptions) {
        unsubscribeFocusedChange.unsubscribe();
    }

    this._focusedChangeSubscriptions = new Array();
  }
}

export const MD_EXPANSION_PANEL_DIRECTIVES: Array<any> = [MdExpansionPanelGroup, MdExpansionPanel];
