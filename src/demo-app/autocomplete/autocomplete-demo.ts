import {FocusMonitor} from '@angular/cdk/a11y';
import {
  Component, ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MdFormFieldControl} from '@angular/material';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import {Subject} from 'rxjs/Subject';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

export interface State {
  code: string;
  name: string;
}

export interface StateGroup {
  letter: string;
  states: State[];
}

@Component({
  moduleId: module.id,
  selector: 'autocomplete-demo',
  templateUrl: 'autocomplete-demo.html',
  styleUrls: ['autocomplete-demo.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class AutocompleteDemo {

}

export class MyTel {
  constructor(public area: string, public exchange: string, public subscriber: string) {}
}

@Component({
  moduleId: module.id,
  selector: 'my-tel-input',
  template: `
    <style>
      div {
        display: flex;
      }
      input {
        border: none;
        background: none;
        padding: 0;
        outline: none;
        font: inherit;
        text-align: center;
      }
      span {
        opacity: 0;
        transition: opacity 200ms;
      }
      :host.floating span {
        opacity: 1;
      }
    </style>
    
    <div [formGroup]="parts">
      <input class="area" formControlName="area" size="3" [disabled]="disabled">
      <span>&ndash;</span>
      <input class="exchange" formControlName="exchange" size="3" [disabled]="disabled">
      <span>&ndash;</span>
      <input class="subscriber" formControlName="subscriber" size="4" [disabled]="disabled">
    </div>
  `,
  providers: [{provide: MdFormFieldControl, useExisting: MyTelInput}],
})
export class MyTelInput implements MdFormFieldControl<MyTel>, OnDestroy {
  static nextId = 0;

  parts: FormGroup;

  stateChanges = new Subject<void>();

  focused = false;

  ngControl = null;

  errorState = false;

  controlType = 'my-tel-input';

  get empty() {
    let n = this.parts.value;
    return !n.area && !n.exchange && !n.subscriber;
  }

  @HostBinding('class.floating')
  get shouldPlaceholderFloat() {
    return this.focused || !this.empty;
  }

  @HostBinding() id = `my-tel-input-${MyTelInput.nextId++}`;

  @HostBinding('attr.aria-describedby') describedBy = '';

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  private _placeholder: string;

  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled() {
    return this._disabled;
  }
  set disabled(dis) {
    this._disabled = coerceBooleanProperty(dis);
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get value(): MyTel | null {
    let n = this.parts.value;
    if (n.area.length == 3 && n.exchange.length == 3 && n.subscriber.length == 4) {
      return new MyTel(n.area, n.exchange, n.subscriber);
    }
    return null;
  }
  set value(tel: MyTel | null) {
    tel = tel || new MyTel('', '', '');
    this.parts.setValue({area: tel.area, exchange: tel.exchange, subscriber: tel.subscriber});
    this.stateChanges.next();
  }

  constructor(fb: FormBuilder, private fm: FocusMonitor, private elRef: ElementRef,
              renderer: Renderer2) {
    this.parts =  fb.group({
      'area': '',
      'exchange': '',
      'subscriber': '',
    });

    fm.monitor(elRef.nativeElement, renderer, true).subscribe((origin) => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() != 'input') {
      this.elRef.nativeElement.querySelector('input').focus();
    }
  }
}
