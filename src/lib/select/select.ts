import {
  Injectable,
  AfterContentInit,
  AfterContentChecked,
  Component,
  ContentChildren,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
  Provider,
  QueryList,
  ViewEncapsulation,
  forwardRef,
  ElementRef,
  NgModule
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule,
} from '@angular/forms';
import {CommonModule} from '@angular/common';

export const MD_SELECT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdSelect),
  multi: true
};

var _uniqueIdCounter = 0;

export type MdSelectDispatcherListener = (id: string, name: string) => void;

@Injectable()
export class MdSelectDispatcher {
  private _listeners: MdSelectDispatcherListener[] = [];

  notify(id: string, name: string) {
    for (let listener of this._listeners) {
      listener(id, name);
    }
  }

  listen(listener: MdSelectDispatcherListener) {
    this._listeners.push(listener);
  }
}

export class MdOptionChange {
  source: MdOption;
  value: any;
}

@Component({
  moduleId: module.id,
  selector: 'md-select',
  template: `
    <div class="md-select-container">
      <span *ngIf="selectedValue.length < 1" class="md-select-placeholder">{{placeholder}}</span>
      <span *ngIf="selectedValue.length > 0" class="md-select-value" [innerHtml]="selectedValue"></span>
      <em class="md-select-icon"></em>
    </div>
    <div class="md-select-menu" [class.open]="isMenuVisible">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    md-select { position: relative; display: block; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -moz-backface-visibility: hidden; -webkit-backface-visibility: hidden; backface-visibility: hidden; }
    md-select:focus { outline: none; }
    md-select .md-select-container { display: flex; width: 100%; align-items: center; padding: 2px 0 1px; border-bottom: 1px solid rgba(0, 0, 0, 0.38); position: relative; -moz-box-sizing: content-box; -webkit-box-sizing: content-box; box-sizing: content-box; min-width: 64px; min-height: 26px; flex-grow: 1; cursor: pointer; }
    md-select:focus .md-select-container { padding-bottom: 0; border-bottom: 2px solid #106cc8; }
    md-select.md-select-disabled .md-select-container { color: rgba(0,0,0,0.38); }
    md-select.md-select-disabled:focus .md-select-container { padding-bottom: 1px; border-bottom: 1px solid rgba(0, 0, 0, 0.38); }
    md-select .md-select-container > span:not(.md-select-icon) { max-width: 100%; -ms-flex: 1 1 auto; -webkit-flex: 1 1 auto; flex: 1 1 auto; -ms-text-overflow: ellipsis; -o-text-overflow: ellipsis; text-overflow: ellipsis; overflow: hidden; }
    md-select .md-select-container .md-select-icon { display: block; -webkit-align-items: flex-end; -ms-flex-align: end; align-items: flex-end; text-align: end; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid rgba(0, 0, 0, 0.60); margin: 0 4px; }
    md-select .md-select-container .md-select-placeholder { color: rgba(0, 0, 0, 0.38); }
    md-select .md-select-container .md-select-value { white-space: nowrap; }
    md-select .md-select-menu { position: absolute; left: 0; top: 100%; display: none; z-index: 10; -ms-flex-direction: column; -webkit-flex-direction: column; flex-direction: column; width: 100%; margin: 0; padding: 8px 0; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12); max-height: 256px; min-height: 48px; overflow-y: auto; -moz-transform: scale(1); -ms-transform: scale(1); -o-transform: scale(1); -webkit-transform: scale(1); transform: scale(1); background: #fff; }
    md-select .md-select-menu.open { display: block; }
  `],
  host: {
    'role': 'select',
    '[tabindex]': 'disabled ? -1 : tabindex',
    '[attr.aria-disabled]': 'disabled'
  },
  providers: [MD_SELECT_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None
})
export class MdSelect implements AfterContentInit, AfterContentChecked, ControlValueAccessor {

  private _value: any = null;
  private _name: string = 'md-select-' + _uniqueIdCounter++;
  private _disabled: boolean = false;
  private _selected: MdOption = null;
  private _isInitialized: boolean = false;

  private isOpenable: boolean = true;
  private isMenuVisible: boolean = false;
  private selectedValue: string = '';

  private focusIndex: number = 0;

  private _controlValueAccessorChangeFn: (value: any) => void = (value) => { };
  onTouched: () => any = () => { };

  @Output() change: EventEmitter<MdOptionChange> = new EventEmitter<MdOptionChange>();

  @ContentChildren(forwardRef(() => MdOption))
  public _options: QueryList<MdOption> = null;

  @Input() get name(): string { return this._name; }
  set name(value: string) {
    this._name = value;
    this._updateOptions();
  }

  @Input() tabindex: number = 0;
  @Input() placeholder: string = '';

  @HostBinding('class.md-select-disabled')
  @Input() get disabled(): boolean { return this._disabled; }
  set disabled(value) {
    this._disabled = (value !== null && value !== false) ? true : null;
  }

  @Input() get value(): any { return this._value; }
  set value(newValue: any) {
    if (this._value !== newValue) {
      this._value = newValue;
      this._updateSelectedOptionValue();
      if (this._isInitialized) {
        this._emitChangeEvent();
      }
    }
  }

  @Input() get selected() { return this._selected; }
  set selected(selected: MdOption) {
    this._selected = selected;
    this.value = selected ? selected.value : null;
    if (selected) {
      if (!selected.selected) { selected.selected = true; }
      this.selectedValue = selected.content;
    } else { this.selectedValue = ''; }
  }

  constructor(public element: ElementRef) { }

  ngAfterContentInit() {
    this._isInitialized = true;
  }

  ngAfterContentChecked() {
    let opt = this._options.filter(o => this.equals(o.value, this.value))[0];
    if (opt) {
      this.selectedValue = opt.content;
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

  /**
   * To update scroll to position of focused option
   */
  private updateScroll() {
    if (this.focusIndex < 0) { return; }
    let menuContainer = this.element.nativeElement.querySelector('.md-select-menu');
    if (!menuContainer) { return; }

    let choices = menuContainer.querySelectorAll('md-option');
    if (choices.length < 1) { return; }

    let highlighted: any = choices[this.focusIndex];
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
   * get index of focused option
   */
  private getFocusIndex(): number { return this._options.toArray().findIndex((o: any) => o.focused); }

  /**
   * update focused option
   * @param inc
   */
  private updateFocus(inc: number) {
    let options = this._options.toArray();
    let index = this.focusIndex;
    options.forEach(o => { if (o.focused) { o.focused = false; } });
    let option: any;
    do {
      index += inc;
      if (index < 0) { index = options.length - 1; }
      if (index > options.length - 1) { index = 0; }
      option = options[index];
      this.focusIndex = index;
      if (option.disabled) { option = undefined; }
    } while (!option);
    if (option) { option.focused = true; }
    this.updateScroll();
  }

  @HostListener('click', ['$event'])
  private onClick(e: any) {
    if (this.disabled) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    if (this.isOpenable) {
      if (!this.isMenuVisible) {
        this._options.forEach(o => {
          o.focused = false;
          if (o.selected) { o.focused = true; }
        });
        this.focusIndex = this.getFocusIndex();
        this.isMenuVisible = true;
        setTimeout(() => {
          this.updateScroll();
        }, 0);
      }
    }
    this.isOpenable = true;
  }

  @HostListener('keydown', ['$event'])
  private onKeyDown(e: any) {
    if (this.disabled) { return; }

    // Tab Key
    if (e.keyCode === 9) {
      if (this.isMenuVisible) {
        this.onBlur();
        e.preventDefault();
      }
      return;
    }

    // Escape Key
    if (e.keyCode === 27) {
      this.onBlur();
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    // Up Arrow
    if (e.keyCode === 38) {
      if (this.isMenuVisible) {
        this.updateFocus(-1);
      } else {
        this.onClick(e);
      }
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    // Down Arrow
    if (e.keyCode === 40) {
      if (this.isMenuVisible) {
        this.updateFocus(1);
      } else {
        this.onClick(e);
      }
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    // Enter / Space
    if (e.keyCode === 13 || e.keyCode === 32) {
      if (this.isMenuVisible) {
        this._options.toArray()[this.focusIndex].onClick(e);
      } else {
        this.onClick(e);
      }
      e.preventDefault();
      return;
    }
  }

  @HostListener('blur')
  public onBlur() {
    this.isMenuVisible = false;
    this.isOpenable = false;
    setTimeout(() => {
      this.isOpenable = true;
    }, 200);
  }

  touch() {
    if (this.onTouched) {
      this.onTouched();
    }
  }

  private _updateOptions(): void {
    (this._options || []).forEach(option => {
      option.name = this.name;
    });
  }

  private _updateSelectedOptionValue(): void {
    let isAlreadySelected = this._selected !== null && this._selected.value === this._value;

    if (this._options !== null && !isAlreadySelected) {
      let matchingOption = this._options.filter(option => option.value === this._value)[0];

      if (matchingOption) {
        this.selected = matchingOption;
      } else if (!this.value) {
        this.selected = null;
        this._options.forEach(option => { option.selected = false; });
      }
    }
  }

  private _emitChangeEvent(): void {
    let event = new MdOptionChange();
    event.source = this._selected;
    event.value = this._value;
    this._controlValueAccessorChangeFn(event.value);
    this.change.emit(event);
  }

  writeValue(value: any) { this.value = value; }

  registerOnChange(fn: (value: any) => void) { this._controlValueAccessorChangeFn = fn; }

  registerOnTouched(fn: any) { this.onTouched = fn; }
}

@Component({
  moduleId: module.id,
  selector: 'md-option',
  template: '<div class="md-option-text"><ng-content></ng-content></div>',
  styles: [`
    md-option { cursor: pointer; position: relative; display: block; align-items: center; width: auto; -moz-transition: background 0.15s linear; -o-transition: background 0.15s linear; -webkit-transition: background 0.15s linear; transition: background 0.15s linear; padding: 0 16px; height: 48px; line-height: 48px; }
    md-option.md-option-selected { color: #106cc8; }
    md-option:hover, md-option.md-option-focused { background: #eeeeee; }
    md-option.md-option-disabled, md-option.md-option-disabled:hover { color: rgba(189,189,189,0.87); cursor: default; background: transparent; }
    md-option .md-option-text { width: auto; white-space: nowrap; overflow: hidden; -ms-text-overflow: ellipsis; -o-text-overflow: ellipsis; text-overflow: ellipsis; font-size: 16px; }
  `],
  host: {
    'role': 'option',
    '(click)': 'onClick($event)'
  },
  encapsulation: ViewEncapsulation.None
})
export class MdOption implements OnInit {

  @HostBinding('class.md-option-focused') focused: boolean = false;

  private _selected: boolean = false;

  @HostBinding('id') @Input() id: string = `md-option-${_uniqueIdCounter++}`;

  name: string;

  private _disabled: boolean;
  private _value: any = null;

  public content: any = null;

  select: MdSelect;

  constructor(select: MdSelect, private selectDispatcher: MdSelectDispatcher, private element: ElementRef) {
    this.select = select;
    selectDispatcher.listen((id: string, name: string) => {
      if (id !== this.id && name === this.name) {
        this.selected = false;
      }
    });
  }

  @HostBinding('class.md-option-selected') @Input() get selected(): boolean { return this._selected; }
  set selected(selected: boolean) {
    if (selected) { this.selectDispatcher.notify(this.id, this.name); }

    this._selected = selected;

    if (selected && this.select.value !== this.value) {
      this.select.selected = this;
    }
  }

  @Input() get value(): any { return this._value; }
  set value(value: any) {
    if (this._value !== value) {
      if (this.selected) {
        this.select.value = value;
      }
      this._value = value;
    }
  }

  @HostBinding('class.md-option-disabled')
  @Input() get disabled(): boolean {
    return this._disabled || (this.select.disabled);
  }

  set disabled(disabled: boolean) {
    this._disabled = disabled;
  }

  ngOnInit() {
    this.selected = this.select.value === this._value;
    this.name = this.select.name;
  }

  ngAfterViewInit() {
    this.content = this.element.nativeElement.innerHTML;
  }

  /**
   * on click to select option
   * @param event
   */
  public onClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.select.selected = this;
    this.select.touch();
    this.select.onBlur();
  }
}

export const MD_SELECT_DIRECTIVES = [MdSelect, MdOption];

@NgModule({
  declarations: MD_SELECT_DIRECTIVES,
  imports: [CommonModule, FormsModule],
  exports: MD_SELECT_DIRECTIVES,
  providers: [MdSelectDispatcher],
})
export class MdSelectModule { }
