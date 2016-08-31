import {
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewEncapsulation,
  NgModule
} from '@angular/core';
import {CommonModule} from '@angular/common';
import { MdTransclude } from './transclude';

export class MdTabChangeEvent {
  index: number;
  tab: MdTab;
}

@Directive({ selector: '[md-tab-label]' })
export class MdTabLabel {
  constructor(public templateRef: TemplateRef<any>) { }
}

@Component({
  moduleId: module.id,
  selector: 'md-tab',
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'mdClass',
    '[class.md-tab]': 'true',
    '[class.active]': 'active'
  }
})
export class MdTab {

  @ContentChild(MdTabLabel) tabLabel: MdTabLabel;

  @Input() label: string;

  @Input() active: boolean;

  @Input() disabled: boolean;

  @Input('class') mdClass: string;

  get labelTemplate(): TemplateRef<any> {
    return this.tabLabel ? this.tabLabel.templateRef : null;
  }

}

@Component({
  moduleId: module.id,
  selector: 'md-tabs',
  template: `
    <div class="md-tabs-header-wrapper">
      <div role="button" class="md-prev-button" [class.disabled]="!canPageBack()" *ngIf="shouldPaginate" (click)="previousPage()">
        <em class="prev-icon">Prev</em>
      </div>
      <div role="button" class="md-next-button" [class.disabled]="!canPageForward()" *ngIf="shouldPaginate" (click)="nextPage()">
        <em class="next-icon">Next</em>
      </div>
      <div class="md-tabs-canvas" [class.md-paginated]="shouldPaginate" role="tablist" tabindex="0" (keydown.arrowRight)="focusNextTab()" (keydown.arrowLeft)="focusPreviousTab()" (keydown.enter)="selectedIndex = focusIndex" (mousewheel)="scroll($event)">
        <div class="md-tabs-header" [style.marginLeft]="-offsetLeft + 'px'">
          <div class="md-tab-label" role="tab" *ngFor="let tab of tabs; let i = index" [class.focus]="focusIndex === i" [class.active]="selectedIndex === i" [class.disabled]="tab.disabled" (click)="focusIndex = selectedIndex = i">
            <span [mdTransclude]="tab.labelTemplate">{{tab.label}}</span>
          </div>
          <div class="md-tab-ink-bar" [style.left]="inkBarLeft" [style.width]="inkBarWidth"></div>
        </div>
      </div>
    </div>
    <div class="md-tabs-body-wrapper">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .md-tabs { position: relative; overflow: hidden; display: block; margin: 0; border: 1px solid #e1e1e1; border-radius: 2px; }
    .md-tabs-header-wrapper { position: relative; display: block; height: 48px; background: white; border-width: 0 0 1px; border-style: solid; border-color: rgba(0,0,0,0.12); display: block; margin: 0; padding: 0; list-style: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
    .md-tabs-header-wrapper:after { content: ''; display: table; clear: both; }
    .md-prev-button,
    .md-next-button { position: absolute; top: 0; height: 100%; width: 32px; padding: 8px 0; z-index: 2; cursor: pointer; }
    .md-prev-button { left: 0; }
    .md-next-button { right: 0; }
    .md-prev-button.disabled,
    .md-next-button.disabled { opacity: .25; cursor: default; }
    .md-prev-button .prev-icon,
    .md-next-button .next-icon { display: block; width: 12px; height: 12px; font-size: 0; border-width: 0 0 2px 2px; border-style: solid; border-color: #757575; border-radius: 1px; transform: rotate(45deg); margin: 10px; }
    .md-next-button .next-icon { border-width: 2px 2px 0 0; }
    .md-tabs-canvas { position: relative; height: 100%; overflow: hidden; display: block; outline: none; }
    .md-tabs-canvas.md-paginated { margin: 0 32px; }
    .md-tabs-header { position: relative; display: inline-block; height: 100%; white-space: nowrap; -moz-transition: 0.5s cubic-bezier(0.35,0,0.25,1); -o-transition: 0.5s cubic-bezier(0.35,0,0.25,1); -webkit-transition: 0.5s cubic-bezier(0.35,0,0.25,1); transition: 0.5s cubic-bezier(0.35,0,0.25,1); }
    .md-tab-label { position: relative; height: 100%; color: rgba(0,0,0,0.54); font-size: 14px; text-align: center; line-height: 24px; padding: 12px 24px; -moz-transition: background-color .35s cubic-bezier(.35,0,.25,1); -o-transition: background-color .35s cubic-bezier(.35,0,.25,1); -webkit-transition: background-color .35s cubic-bezier(.35,0,.25,1); transition: background-color .35s cubic-bezier(.35,0,.25,1); cursor: pointer; white-space: nowrap; text-transform: uppercase; display: inline-block; font-weight: 500; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; overflow: hidden; -ms-text-overflow: ellipsis; -o-text-overflow: ellipsis; text-overflow: ellipsis; }
    .md-tab-label.active { color: rgb(16,108,200); }
    .md-tabs-canvas:focus .md-tab-label.focus { background: rgba(0,0,0,0.05); }
    .md-tab-label.disabled { color: rgba(0,0,0,0.26); pointer-events: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-user-drag: none; opacity: 0.5; cursor: default; }
    .md-tab-ink-bar { position: absolute; bottom: 0; height: 2px; background: rgb(255,82,82); transition: .25s cubic-bezier(.35,0,.25,1); }
    .md-tabs-body-wrapper { position: relative; min-height: 0; display: block; clear: both; }
    .md-tab { padding: 16px; display: none; position: relative; }
    .md-tab.active { display: block; position: relative; }
  `],
  host: {
    '[class]': 'mdClass',
    '[class.md-tabs]': 'true',
    '(window:resize)': 'onWindowResize($event)'
  },
  encapsulation: ViewEncapsulation.None
})
export class MdTabs implements AfterContentInit {

  @ContentChildren(MdTab) tabs: QueryList<MdTab>;

  private _isInitialized: boolean = false;
  private _focusIndex: number = 0;
  private _selectedIndex: number = 0;
  private shouldPaginate: boolean = false;
  private offsetLeft: number = 0;
  private inkBarLeft: string = '0';
  private inkBarWidth: string = '0';

  @Input('class') mdClass: string;

  @Input()
  set selectedIndex(value: any) {
    if (typeof value === 'string') { value = parseInt(value); }
    if (value != this._selectedIndex) {
      this._selectedIndex = value;
      this.adjustOffset(value);
      this._updateInkBar();
      if (this.tabs) {
        const tabs = this.tabs.toArray();
        if (!tabs[value].disabled) {
          tabs.forEach(tab => tab.active = false);
          tabs[value].active = true;
        }
      }
      if (this._isInitialized) {
        this.change.emit(this._createChangeEvent(value));
      }
    }
  }
  get selectedIndex() { return this._selectedIndex; }

  get focusIndex(): number { return this._focusIndex; }
  set focusIndex(value: number) {
    this._focusIndex = value;
    this.adjustOffset(value);
  }

  get element() {
    const elements: any = { root: this.elementRef.nativeElement, wrapper: null, canvas: null, paging: null, tabs: null };
    elements.wrapper = elements.root.querySelector('.md-tabs-header-wrapper');
    elements.canvas = elements.wrapper.querySelector('.md-tabs-canvas');
    elements.paging = elements.canvas.querySelector('.md-tabs-header');
    elements.tabs = elements.paging.querySelectorAll('.md-tab-label');
    return elements;
  }

  @Output() change: EventEmitter<MdTabChangeEvent> = new EventEmitter<MdTabChangeEvent>();

  constructor(private elementRef: ElementRef) { }

  /**
   * After Content Init
   */
  ngAfterContentInit() {
    setTimeout(() => {
      this.updatePagination();
    }, 0);
    setTimeout(() => {
      const tabs = this.tabs.toArray();
      if (this.selectedIndex) {
        tabs.forEach(tab => tab.active = false);
        tabs[this.selectedIndex].active = true;
        this.adjustOffset(this.selectedIndex);
      } else {
        let index = tabs.findIndex((t: any) => t.active);
        if (index < 0) {
          tabs[0].active = true;
        } else {
          this.selectedIndex = index;
        }
      }
      this._updateInkBar();
    }, 0);
    this._isInitialized = true;
  }

  /**
   * Calculates the styles from the selected tab for the ink-bar.
   */
  private _updateInkBar(): void {
    let elements = this.element;
    if (!elements.tabs[this.selectedIndex]) { return; }
    let tab = elements.tabs[this.selectedIndex];
    this.inkBarLeft = tab.offsetLeft + 'px';
    this.inkBarWidth = tab.offsetWidth + 'px';
  }

  /**
   * Create Change Event
   * @param index
   * @return event of MdTabChangeEvent
   */
  private _createChangeEvent(index: number): MdTabChangeEvent {
    const event = new MdTabChangeEvent;
    event.index = index;
    if (this.tabs && this.tabs.length) {
      event.tab = this.tabs.toArray()[index];
    }
    return event;
  }

  /**
   * Focus next Tab
   */
  focusNextTab() { this.incrementIndex(1); }

  /**
   * Focus previous Tab
   */
  focusPreviousTab() { this.incrementIndex(-1); }

  /**
   * Mouse Wheel scroll
   * @param event
   */
  scroll(event: any) {
    if (!this.shouldPaginate) { return; }
    event.preventDefault();
    this.offsetLeft = this.fixOffset(this.offsetLeft - event.wheelDelta);
  }

  /**
   * Next Page
   */
  nextPage() {
    let elements = this.element;
    let viewportWidth = elements.canvas.clientWidth,
      totalWidth = viewportWidth + this.offsetLeft,
      i: number, tab: any;
    for (i = 0; i < elements.tabs.length; i++) {
      tab = elements.tabs[i];
      if (tab.offsetLeft + tab.offsetWidth > totalWidth) { break; }
    }
    this.offsetLeft = this.fixOffset(tab.offsetLeft);
  }

  /**
   * Previous Page
   */
  previousPage() {
    let i: number, tab: any, elements = this.element;

    for (i = 0; i < elements.tabs.length; i++) {
      tab = elements.tabs[i];
      if (tab.offsetLeft + tab.offsetWidth >= this.offsetLeft) { break; }
    }
    this.offsetLeft = this.fixOffset(tab.offsetLeft + tab.offsetWidth - elements.canvas.clientWidth);
  }

  /**
   * On Window Resize
   * @param event
   */
  onWindowResize(event: Event) {
    this.offsetLeft = this.fixOffset(this.offsetLeft);
    this.updatePagination();
  }

  /**
   * Can page Back
   */
  canPageBack() { return this.offsetLeft > 0; }

  /**
   * Can page Previous
   */
  canPageForward() {
    let elements = this.element;
    let lastTab = elements.tabs[elements.tabs.length - 1];
    return lastTab && lastTab.offsetLeft + lastTab.offsetWidth > elements.canvas.clientWidth +
      this.offsetLeft;
  }

  /**
   * Update Pagination
   */
  updatePagination() {
    let canvasWidth = this.element.root.clientWidth;
    this.element.tabs.forEach((tab: any) => {
      canvasWidth -= tab.offsetWidth;
    });
    this.shouldPaginate = canvasWidth < 0;
  }

  /**
   * Increment Focus Tab
   * @param inc
   */
  incrementIndex(inc: any) {
    let newIndex: number,
      index = this.focusIndex;
    for (newIndex = index + inc;
      this.tabs.toArray()[newIndex] && this.tabs.toArray()[newIndex].disabled;
      newIndex += inc) { }
    if (this.tabs.toArray()[newIndex]) {
      this.focusIndex = newIndex;
    }
  }

  /**
   * Adjust Offset of Tab
   * @param index
   */
  adjustOffset(index: number) {
    let elements = this.element;
    if (!elements.tabs[index]) { return; }
    let tab = elements.tabs[index],
      left = tab.offsetLeft,
      right = tab.offsetWidth + left;
    this.offsetLeft = Math.max(this.offsetLeft, this.fixOffset(right - elements.canvas.clientWidth + 32 * 2));
    this.offsetLeft = Math.min(this.offsetLeft, this.fixOffset(left));
  }

  /**
   * Fix Offset of Tab
   * @param value
   * @return value
   */
  fixOffset(value: any) {
    let elements = this.element;
    if (!elements.tabs.length || !this.shouldPaginate) { return 0; }
    let lastTab = elements.tabs[elements.tabs.length - 1],
      totalWidth = lastTab.offsetLeft + lastTab.offsetWidth;
    value = Math.max(0, value);
    value = Math.min(totalWidth - elements.canvas.clientWidth, value);
    return value;
  }

}

export const TABS_DIRECTIVES = [MdTabs, MdTab, MdTabLabel];

export const MD_TABS_DIRECTIVES: any[] = [MdTabs, MdTab, MdTabLabel, MdTransclude];

@NgModule({
  imports: [CommonModule],
  exports: MD_TABS_DIRECTIVES,
  declarations: MD_TABS_DIRECTIVES,
})
export class MdTabsModule { }
