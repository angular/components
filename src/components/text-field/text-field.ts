import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from 'angular2/core';

@Component({
  selector: '[md-text-field], [md-text-field-floating-label]',
  inputs: ['color'],
  host: {
    '[class.md-textfield-focus]': 'isKeyboardFocused',
    '[class]': 'setClassList()',
    '(focus)': 'setKeyboardFocus()',
    '(blur)': 'removeKeyboardFocus()'
  },
  templateUrl: './components/text-field/text-field.html',
  styleUrls: ['./components/text-field/text-field.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdTextField {
  color: string;
  private domId: string;

  constructor() {
    this.domId = this.uuid();
  }

  /** Whether the button has focus from the keyboard (not the mouse). Used for class binding. */
  isKeyboardFocused: boolean = false;

  setClassList() {
    return `md-${this.color}`;
  }

  setKeyboardFocus($event: any) {
    this.isKeyboardFocused = true;
  }

  removeKeyboardFocus() {
    this.isKeyboardFocused = false;
  }

  s4(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  uuid(): string {
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
      this.s4() + '-' + this.s4() + this.s4() + this.s4();
  }
}
