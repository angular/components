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
  NgModule,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule,
} from '@angular/forms';
import {CommonModule} from '@angular/common';
//import { HightlightPipe } from '../autocomplete/autocomplete.pipe';
import {MdAutocompleteModule} from '@angular2-material/autocomplete/autocomplete';

const noop = () => { };

let nextId = 0;

class Tag {
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

export const MD_TAGS_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdTags),
  multi: true
};

@Component({
  moduleId: module.id,
  selector: 'md-tags',
  template: `
    <div class="md-tags-container">
      <span *ngFor="let t of items; let i = index;" class="md-tag" [class.active]="selectedTag === i" (click)="selectTag(i)">
        <span class="md-tag-text">{{t.text}}</span>
        <span class="md-remove-icon" (click)="removeTagAndFocusInput(i)"></span>
      </span>
      <span class="md-tag-add">
        <input [(ngModel)]="tagBuffer" type="text" tabs="false" autocomplete="off" tabindex="-1" [disabled]="disabled" class="md-tags-input" [placeholder]="placeholder" (focus)="onInputFocus()" (blur)="onInputBlur()" (keydown)="inputKeydown($event)" (change)="$event.stopPropagation()" />
        <ul *ngIf="isMenuVisible" class="md-tags-menu" (mouseenter)="listEnter()" (mouseleave)="listLeave()">
          <li class="md-option" *ngFor="let l of list; let i = index;" [class.focused]="focusedTag === i" (click)="addTag($event, i)">
            <span class="md-option-text" [innerHtml]="l.text | hightlight:tagBuffer"></span>
          </li>
        </ul>
      </span>
    </div>
  `,
  styles: [`
    .md-tags { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -moz-backface-visibility: hidden; -webkit-backface-visibility: hidden; backface-visibility: hidden; }
    .md-tags:focus { outline: none; }
    .md-tags .md-tags-container { position: relative; display: block; max-width: 100%; padding: 2px 3px 8px; border-bottom: 1px solid rgba(0, 0, 0, 0.38); -moz-box-sizing: content-box; -webkit-box-sizing: content-box; box-sizing: content-box; min-width: 64px; min-height: 26px; cursor: text; }
    .md-tags .md-tags-container:before, .md-tags .md-tags-container:after { display: table; content: " "; }
    .md-tags .md-tags-container:after { clear: both; }
    .md-tags.focus .md-tags-container { padding-bottom: 7px; border-bottom: 2px solid #106cc8; }
    .md-tags.md-tags-disabled .md-tags-container { color: rgba(0,0,0,0.38); cursor: default; }
    .md-tags.md-tags-disabled.focus .md-tags-container { padding-bottom: 1px; border-bottom: 1px solid rgba(0, 0, 0, 0.38); }
    .md-tags .md-tags-container .md-tag { position: relative; cursor: default; border-radius: 16px; display: block; height: 32px; line-height: 32px; margin: 8px 8px 0 0; padding: 0 26px 0 12px; float: left; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; max-width: 100%; background: rgb(224,224,224); color: rgb(66,66,66); white-space: nowrap; overflow: hidden; -ms-text-overflow: ellipsis; -o-text-overflow: ellipsis; text-overflow: ellipsis; }
    .md-tags .md-tags-container .md-tag.active { background: #106cc8; color: rgba(255,255,255,0.87); }
    .md-tags .md-tags-container .md-tag .md-remove-icon { position: absolute; top: 8px; right: 1px; cursor: pointer; display: inline-block; width: 16px; height: 16px; margin: 0 4px; overflow: hidden; }
    .md-tags .md-tag .md-remove-icon::before,
    .md-tags .md-tag .md-remove-icon::after { content: ''; position: absolute; height: 2px; width: 100%; top: 50%; left: 0; margin-top: -1px; background: #888; border-radius: 2px; }
    .md-tags .md-tag.active .md-remove-icon::before,
    .md-tags .md-tag.active .md-remove-icon::after { background: rgba(255,255,255,0.87); }
    .md-tags .md-tag .md-remove-icon::before { -webkit-transform: rotate(45deg); -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); -o-transform: rotate(45deg); transform: rotate(45deg); }
    .md-tags .md-tag .md-remove-icon::after { -webkit-transform: rotate(-45deg); -moz-transform: rotate(-45deg); -ms-transform: rotate(-45deg); -o-transform: rotate(-45deg); transform: rotate(-45deg); }
    .md-tags .md-tag-add { position: relative; display: inline-block; }
    .md-tags input { border: 0; outline: 0; margin-top: 8px; height: 32px; line-height: 32px; padding: 0; color: rgba(0,0,0,0.87); background: 0 0; }
    .md-tags .md-tags-container .md-tags-placeholder { color: rgba(0, 0, 0, 0.38); }
    .md-tags .md-tags-menu { position: absolute; left: 0; top: 100%; display: block; z-index: 10; -ms-flex-direction: column; -webkit-flex-direction: column; flex-direction: column; width: 100%; margin: 6px 0 0; padding: 8px 0; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12); max-height: 256px; min-height: 48px; overflow-y: auto; -moz-transform: scale(1); -ms-transform: scale(1); -o-transform: scale(1); -webkit-transform: scale(1); transform: scale(1); background: #fff; }
    .md-tags .md-tags-menu .md-option { cursor: pointer; position: relative; display: block; align-items: center; width: auto; -moz-transition: background 0.15s linear; -o-transition: background 0.15s linear; -webkit-transition: background 0.15s linear; transition: background 0.15s linear; padding: 0 16px; height: 48px; line-height: 48px; }
    .md-tags .md-tags-menu .md-option:hover, .md-tags .md-tags-menu .md-option.focused { background: #eeeeee; }
    .md-tags .md-tags-menu .md-option .md-option-text { width: auto; white-space: nowrap; overflow: hidden; -ms-text-overflow: ellipsis; -o-text-overflow: ellipsis; text-overflow: ellipsis; font-size: 16px; }
    .md-tags .highlight { color: #757575; }
  `],
  host: {
    'role': 'tags',
    '[id]': 'id',
    '[class.md-tags]': 'true',
    '[class.focus]': 'inputFocused || selectedTag >= 0',
    '[class.md-tags-disabled]': 'disabled',
    '[tabindex]': 'disabled ? -1 : tabindex',
    '[attr.aria-disabled]': 'disabled'
  },
  providers: [MD_TAGS_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None
})

export class MdTags implements AfterContentInit, ControlValueAccessor {

  constructor(private element: ElementRef) { }

  ngAfterContentInit() {
    this._isInitialized = true;
  }

  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  private _value: any = '';
  private _isInitialized: boolean = false;
  private _onTouchedCallback: () => void = noop;
  private _onChangeCallback: (_: any) => void = noop;

  private _tags: Array<any> = [];
  private list: Array<Tag> = [];
  private items: Array<Tag> = [];

  private focusedTag: number = 0;
  private selectedTag: number = -1;
  private tagBuffer: string = '';
  private inputFocused: boolean = false;
  private noBlur: boolean = true;

  @Input() id: string = 'md-tags-' + (++nextId);
  @Input() disabled: boolean = false;
  @Input() tabindex: number = 0;
  @Input() placeholder: string = '';
  @Input('md-tag-text') textKey: string = 'text';
  @Input('md-tag-value') valueKey: string = null;

  @Input('md-tags') set tags(value: Array<any>) {
    this._tags = value;
  }

  get value(): any {
    return this._value;
  }
  @Input() set value(value: any) {
    this.setValue(value);
  }

  /**
   * setup value
   * @param value
   */
  private setValue(value: any) {
    if (value !== this._value) {
      this._value = value;
      this.items = [];
      if (value && value.length && typeof value === 'object' && Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          let selItm = this._tags.find((t: any) => this.equals(this.valueKey ? t[this.valueKey] : t, value[i]));
          if (selItm) { this.items.push(new Tag(selItm, this.textKey, this.valueKey)); }
        }
      }
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
    return ((this.inputFocused || this.noBlur) && this.tagBuffer && this.list && this.list.length) ? true : false;
  }

  /**
   * update scroll of tags suggestion menu
   */
  private updateScroll() {
    if (this.focusedTag < 0) { return; }
    let menuContainer = this.element.nativeElement.querySelector('.md-tags-menu');
    if (!menuContainer) { return; }

    let choices = menuContainer.querySelectorAll('.md-option');
    if (choices.length < 1) { return; }

    let highlighted: any = choices[this.focusedTag];
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
   * input key listener
   * @param event
   */
  private inputKeydown(event: KeyboardEvent) {
    // Backspace
    if (event.keyCode === 8 && !this.tagBuffer) {
      event.preventDefault();
      event.stopPropagation();
      if (this.items.length && this.selectedTag < 0) { this.selectAndFocusTagSafe(this.items.length - 1); }
      if (this.items.length && this.selectedTag > -1) { this.removeAndSelectAdjacentTag(this.selectedTag); }
      return;
    }
    // Del Key
    if (event.keyCode === 46 && !this.tagBuffer) { return; }
    // Left / Right Arrow
    if ((event.keyCode === 37 || event.keyCode === 39) && !this.tagBuffer) { return; }
    // Down Arrow
    if (event.keyCode === 40) {
      if (!this.isMenuVisible) { return; }
      event.stopPropagation();
      event.preventDefault();
      this.focusedTag = (this.focusedTag === this.list.length - 1) ? 0 : Math.min(this.focusedTag + 1, this.list.length - 1);
      this.updateScroll();
      return;
    }
    // Up Arrow
    if (event.keyCode === 38) {
      if (!this.isMenuVisible) { return; }
      event.stopPropagation();
      event.preventDefault();
      this.focusedTag = (this.focusedTag === 0) ? this.list.length - 1 : Math.max(0, this.focusedTag - 1);
      this.updateScroll();
      return;
    }
    // Tab Key
    if (event.keyCode === 9) { return; }
    // Enter / Space
    if (event.keyCode === 13 || event.keyCode === 32) {
      if (!this.tagBuffer || !this.isMenuVisible) { event.preventDefault(); return; }
      event.preventDefault();
      this.addTag(event, this.focusedTag);
      return;
    }
    // Escape Key
    if (event.keyCode === 27) {
      event.stopPropagation();
      event.preventDefault();
      if (this.tagBuffer) { this.tagBuffer = ''; }
      if (this.selectedTag >= 0) { this.onFocus(); }
      return;
    }
    // reset selected tag
    if (this.selectedTag >= 0) { this.resetselectedTag(); }
    // filter
    setTimeout(() => {
      this.filterMatches(new RegExp(this.tagBuffer, 'ig'));
    }, 10);
  }

  @HostListener('keydown', ['$event'])
  private onKeydown(event: KeyboardEvent) {
    if (this.tagBuffer || this.disabled) { return; }

    // Backspace / Del Key
    if (event.keyCode === 8 || event.keyCode === 46) {
      if (this.selectedTag < 0) { return; }
      event.preventDefault();
      this.removeAndSelectAdjacentTag(this.selectedTag);
    }

    // Left Arrow
    if (event.keyCode === 37) {
      event.preventDefault();
      if (this.selectedTag < 0) { this.selectedTag = this.items.length; }
      if (this.items.length) { this.selectAndFocusTagSafe(this.selectedTag - 1); }
    }

    // Right Arrow
    if (event.keyCode === 39) {
      event.preventDefault();
      if (this.selectedTag >= this.items.length) { this.selectedTag = -1; }
      this.selectAndFocusTagSafe(this.selectedTag + 1);
    }

    // Escape / Tab Key
    if (event.keyCode === 27 || event.keyCode === 9) {
      if (this.selectedTag < 0) { return; }
      event.preventDefault();
      this.onFocus();
    }
  }

  private removeAndSelectAdjacentTag(index: number) {
    var selIndex = this.getAdjacentTagIndex(index);
    this.removeTag(index);
    this.selectAndFocusTagSafe(selIndex);
  }

  private resetselectedTag() {
    this.selectedTag = -1;
  }

  private getAdjacentTagIndex(index: number) {
    var len = this.items.length - 1;
    return (len === 0) ? -1 :
      (index === len) ? index - 1 : index;
  }

  /**
   * add tag
   * @param event
   * @param index index of the specific tag
   */
  private addTag(event: Event, index: number) {
    event.preventDefault();
    event.stopPropagation();
    this.items.push(this.list[index]);
    this.tagBuffer = '';
    this.updateValue();
  }

  private removeTagAndFocusInput(index: number) {
    this.removeTag(index);
    this.onFocus();
  }

  /**
   * remove tag
   * @param index
   */
  private removeTag(index: number) {
    this.items.splice(index, 1);
    this.updateValue();
  }

  /**
   * update value
   */
  private updateValue() {
    this._value = new Array<any>();
    for (let i = 0; i < this.items.length; i++) {
      this._value.push(this.items[i].value);
    }
    this._onChangeCallback(this._value);
    this.change.emit(this._value);
  }

  private selectAndFocusTagSafe = function (index: number) {
    if (!this.items.length) {
      this.selectTag(-1);
      this.onFocus();
      return;
    }
    if (index === this.items.length) { return this.onFocus(); }
    index = Math.max(index, 0);
    index = Math.min(index, this.items.length - 1);
    this.selectTag(index);
  };

  /**
   * select tag
   * @param index of select tag
   */
  private selectTag(index: number) {
    if (index >= -1 && index <= this.items.length) {
      this.selectedTag = index;
    }
  }

  @HostListener('focus')
  private onFocus() {
    this.element.nativeElement.querySelector('input').focus();
    this.resetselectedTag();
  }

  private onInputFocus() {
    this.inputFocused = true;
    this.resetselectedTag();
  }

  private onInputBlur() {
    this.inputFocused = false;
  }

  private listEnter() { this.noBlur = true; }

  private listLeave() { this.noBlur = false; }

  /**
   * update suggestion menu with filter
   * @param query
   */
  private filterMatches(query: RegExp) {
    let tempList = this._tags.map((tag: any) => new Tag(tag, this.textKey, this.valueKey));
    this.list = tempList.filter((t: Tag) => (query.test(t.text) && !this.items.find((i: Tag) => t.text === i.text)));
    if (this.list.length > 0) {
      this.focusedTag = 0;
    }
  }

  writeValue(value: any) {
    this.setValue(value);
  }

  registerOnChange(fn: any) { this._onChangeCallback = fn; }

  registerOnTouched(fn: any) { this._onTouchedCallback = fn; }
}

export const MD_TAGS_DIRECTIVES = [MdTags];

@NgModule({
  declarations: MD_TAGS_DIRECTIVES,
  imports: [CommonModule, FormsModule, MdAutocompleteModule],
  exports: MD_TAGS_DIRECTIVES,
})
export class MdTagsModule { }
