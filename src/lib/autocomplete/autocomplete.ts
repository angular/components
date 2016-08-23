import {
  AfterContentInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  Output,
  Provider,
  ViewEncapsulation,
  NgModule
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule,
} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {HightlightPipe} from './autocomplete.pipe';

class Item {
  public text: string;
  public value: string;

  constructor(source: any, textKey: string, valueKey: string) {
    if (typeof source === 'string') {
      this.text = this.value = source;
    }
    if (typeof source === 'object') {
      this.text = source[textKey];
      this.value = valueKey ? source[valueKey] : source;
    }
  }
}

const noop = () => { };

let nextId = 0;

export const MD_AUTOCOMPLETE_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdAutocomplete),
  multi: true
};

@Component({
  moduleId: module.id,
  selector: 'md-autocomplete',
  template: `
    <div class="md-autocomplete-wrap">
      <input [(ngModel)]="inputBuffer" type="text" tabs="false" autocomplete="off" [tabindex]="disabled ? -1 : tabindex" [disabled]="disabled" class="md-autocomplete-input" [placeholder]="placeholder" (focus)="onInputFocus()" (blur)="onInputBlur()" (keydown)="inputKeydown($event)" (change)="$event.stopPropagation()" />
      <em *ngIf="inputBuffer" (click)="onClear()" class="md-autocomplete-clear-icon"></em>
    </div>
    <ul *ngIf="isMenuVisible" class="md-autocomplete-menu" (mouseenter)="listEnter()" (mouseleave)="listLeave()">
      <li class="md-option" *ngFor="let l of list; let i = index;" [class.focus]="focusedOption === i" (click)="select($event, i)">
        <div class="md-text" [innerHtml]="l.text | hightlight:inputBuffer"></div>
      </li>
    </ul>
  `,
  styles: [`
    .md-autocomplete { position: relative; display: block; outline: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -moz-backface-visibility: hidden; -webkit-backface-visibility: hidden; backface-visibility: hidden; }
    .md-autocomplete .md-autocomplete-wrap { position: relative; display: block; width: 100%; padding: 2px 0 1px; border-bottom: 1px solid rgba(0, 0, 0, 0.38); -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; min-width: 64px; min-height: 26px; max-height: 90px; cursor: pointer; }
    .md-autocomplete.disabled .md-autocomplete-wrap { color: rgba(0,0,0,0.38); }
    .md-autocomplete-wrap .md-autocomplete-input { width: 100%; height: 26px; outline: none; background: transparent; border: 0; -moz-box-sizing: content-box; -webkit-box-sizing: content-box; box-sizing: content-box; }
    .md-autocomplete-wrap .md-autocomplete-clear-icon { position: absolute; top: 50%; right: 0; display: inline-block; width: 18px; height: 18px; margin: -9px 2px 0; overflow: hidden; }
    .md-autocomplete-wrap .md-autocomplete-clear-icon::before,
    .md-autocomplete-wrap .md-autocomplete-clear-icon::after { content: ''; position: absolute; height: 2px; width: 100%; top: 50%; left: 0; margin-top: -1px; background: #888; border-radius: 2px; height: 2px; }
    .md-autocomplete-wrap .md-autocomplete-clear-icon::before { -webkit-transform: rotate(45deg); -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); -o-transform: rotate(45deg); transform: rotate(45deg); }
    .md-autocomplete-wrap .md-autocomplete-clear-icon::after { -webkit-transform: rotate(-45deg); -moz-transform: rotate(-45deg); -ms-transform: rotate(-45deg); -o-transform: rotate(-45deg); transform: rotate(-45deg); }
    .md-autocomplete-menu { position: absolute; left: 0; top: 100%; display: block; z-index: 10; width: 100%; margin: 0; padding: 8px 0; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12); max-height: 256px; min-height: 48px; overflow-y: auto; background: #fff; }
    .md-autocomplete-menu .md-option { position: relative; display: block; cursor: pointer; width: auto; padding: 0 16px; height: 48px; line-height: 48px; -moz-transition: background 0.15s linear; -o-transition: background 0.15s linear; -webkit-transition: background 0.15s linear; transition: background 0.15s linear; }
    .md-autocomplete-menu .md-option:hover,
    .md-autocomplete-menu .md-option.focus { background: #eeeeee; }
    .md-autocomplete-menu .md-option .md-text { width: auto; white-space: nowrap; overflow: hidden; -ms-text-overflow: ellipsis; -o-text-overflow: ellipsis; text-overflow: ellipsis; font-size: 16px; }
    .md-autocomplete-menu .highlight { color: #757575; }
  `],
  host: {
    'role': 'autocomplete',
    '[id]': 'id',
    '[class.md-autocomplete]': 'true',
    '[class.md-autocomplete-disabled]': 'disabled',
    '[attr.aria-disabled]': 'disabled'
  },
  providers: [MD_AUTOCOMPLETE_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None
})

export class MdAutocomplete implements AfterContentInit, ControlValueAccessor {

  constructor(private element: ElementRef) { }

  ngAfterContentInit() { this._isInitialized = true; }

  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  private _value: any = '';
  private _isInitialized: boolean = false;
  private _onTouchedCallback: () => void = noop;
  private _onChangeCallback: (_: any) => void = noop;

  private _items: Array<any> = [];
  private list: Array<Item> = [];

  private focusedOption: number = 0;
  private inputBuffer: string = '';
  private selectedItem: Item = null;
  private inputFocused: boolean = false;
  private noBlur: boolean = true;

  @Input() id: string = 'md-autocomplete-' + (++nextId);
  @Input() disabled: boolean = false;
  @Input() tabindex: number = 0;
  @Input() placeholder: string = '';
  @Input('item-text') textKey: string = 'text';
  @Input('item-value') valueKey: string = null;

  @Input() set items(value: Array<any>) {
    this._items = value;
  }

  get value(): any {
    return this._value;
  }
  @Input() set value(value: any) {
    this.setValue(value);
  }

  /**
   * set value
   * @param value of ngModel
   */
  private setValue(value: any) {
    if (value !== this._value) {
      this._value = value;
      this.inputBuffer = '';
      if (value) {
        let selItm = this._items.find((i: any) => this.equals(this.valueKey ? i[this.valueKey] : i, value));
        this.selectedItem = new Item(selItm, this.textKey, this.valueKey);
        if (this.selectedItem) { this.inputBuffer = this.selectedItem.text; }
      }
      if (!this.inputBuffer) { this.inputBuffer = ''; }
      if (this._isInitialized) {
        this._onChangeCallback(value);
        this.change.emit(this._value);
      }
    }
  }

  /**
   * Compare two vars or objects
   * @param o1 compare first object
   * @param o2 compare second object
   * @return boolean comparation result
   */
  private equals(o1: any, o2: any) {
    if (o1 === o2) { return true; }
    if (o1 === null || o2 === null) { return false; }
    if (o1 !== o1 && o2 !== o2) { return true; }
    let t1 = typeof o1, t2 = typeof o2, length: any, key: any, keySet: any;
    if (t1 === t2 && t1 === 'object') {
      keySet = Object.create(null);
      for (key in o1) {
        if (!this.equals(o1[key], o2[key])) { return false; }
        keySet[key] = true;
      }
      for (key in o2) {
        if (!(key in keySet) && key.charAt(0) !== '$' && o2[key]) { return false; }
      }
      return true;
    }
    return false;
  }

  get isMenuVisible(): boolean {
    return ((this.inputFocused || this.noBlur) && this.list && this.list.length && !this.selectedItem) ? true : false;
  }

  /**
   * update scroll of suggestion menu
   */
  private updateScroll() {
    if (this.focusedOption < 0) { return; }
    let menuContainer = this.element.nativeElement.querySelector('.md-autocomplete-menu');
    if (!menuContainer) { return; }

    let choices = menuContainer.querySelectorAll('.md-option');
    if (choices.length < 1) { return; }

    let highlighted: any = choices[this.focusedOption];
    if (!highlighted) { return; }

    let top: number = highlighted.offsetTop + highlighted.clientHeight - menuContainer.scrollTop;
    let height: number = menuContainer.offsetHeight;

    if (top > height) {
      menuContainer.scrollTop += top - height;
    } else if (top < highlighted.clientHeight) {
      menuContainer.scrollTop -= highlighted.clientHeight - top;
    }
  }

  /**
   * input event listner
   * @param event
   */
  private inputKeydown(event: KeyboardEvent) {
    if (this.disabled) { return; }
    // Down Arrow
    if (event.keyCode === 40) {
      if (!this.isMenuVisible) { return; }
      event.stopPropagation();
      event.preventDefault();
      this.focusedOption = (this.focusedOption === this.list.length - 1) ? 0 : Math.min(this.focusedOption + 1, this.list.length - 1);
      this.updateScroll();
      return;
    }
    // Up Arrow
    if (event.keyCode === 38) {
      if (!this.isMenuVisible) { return; }
      event.stopPropagation();
      event.preventDefault();
      this.focusedOption = (this.focusedOption === 0) ? this.list.length - 1 : Math.max(0, this.focusedOption - 1);
      this.updateScroll();
      return;
    }
    // Tab Key
    if (event.keyCode === 9) {
      this.listLeave();
      return;
    }
    // Escape Key
    if (event.keyCode === 27) {
      event.stopPropagation();
      event.preventDefault();
      this.onClear();
      return;
    }
    // Enter
    if (event.keyCode === 13) {
      if (this.isMenuVisible) {
        this.select(event, this.focusedOption);
      }
      event.preventDefault();
      return;
    }
    // filter
    setTimeout(() => {
      this.updateItems(new RegExp(this.inputBuffer, 'ig'));
    }, 10);
  }

  /**
   * select option
   * @param event
   * @param index of selected item
   */
  private select(event: Event, index: number) {
    event.preventDefault();
    event.stopPropagation();
    this.selectedItem = this.list[index];
    this.inputBuffer = this.list[index].text;
    this.updateValue();
  }

  /**
   * clear selected suggestion
   */
  private onClear() {
    if (this.disabled) { return; }
    this.inputBuffer = '';
    this.selectedItem = null;
    this.updateItems(new RegExp(this.inputBuffer, 'ig'));
    this._value = this.selectedItem ? this.selectedItem.value : this.selectedItem;
    this.updateValue();
  }

  /**
   * update value
   */
  private updateValue() {
    this._value = this.selectedItem ? this.selectedItem.value : this.selectedItem;
    this._onChangeCallback(this._value);
    this.change.emit(this._value);
    this.onFocus();
  }

  /**
   * component focus listener
   */
  private onFocus() {
    if (this.disabled) { return; }
    this.element.nativeElement.querySelector('input').focus();
  }

  /**
   * input focus listener
   */
  private onInputFocus() {
    this.inputFocused = true;
    this.updateItems(new RegExp(this.inputBuffer, 'ig'));
    this.focusedOption = 0;
  }

  /**
   * input blur listener
   */
  private onInputBlur() {
    this.inputFocused = false;
  }

  /**
   * suggestion menu mouse enter listener
   */
  private listEnter() { this.noBlur = true; }

  /**
   * suggestion menu mouse leave listener
   */
  private listLeave() { this.noBlur = false; }

  /**
   * Update suggestion to filter the query
   * @param query
   */
  private updateItems(query: RegExp) {
    this.list = this._items.map((i: any) => new Item(i, this.textKey, this.valueKey)).filter(i => query.test(i.text));
    if (this.list.length && this.list[0].text !== this.inputBuffer) {
      this.selectedItem = null;
    }
  }

  writeValue(value: any) { this.setValue(value); }

  registerOnChange(fn: any) { this._onChangeCallback = fn; }

  registerOnTouched(fn: any) { this._onTouchedCallback = fn; }
}

export const MD_AUTOCOMPLETE_DIRECTIVES = [MdAutocomplete, HightlightPipe];

@NgModule({
  declarations: MD_AUTOCOMPLETE_DIRECTIVES,
  imports: [CommonModule, FormsModule],
  exports: MD_AUTOCOMPLETE_DIRECTIVES,
})
export class MdAutocompleteModule { }

