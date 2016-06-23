import {
  Component,
  ViewChild,
} from '@angular/core';
import {MdButton} from '@angular2-material/button/button';
import {MdCard} from '@angular2-material/card/card';
import {MdCheckbox} from '@angular2-material/checkbox/checkbox';
import {MdIcon} from '@angular2-material/icon/icon';
import {MdInkRipple} from '@angular2-material/ripple/ripple';
import {MdInput} from '@angular2-material/input/input';
import {MdRadioButton, MdRadioGroup} from '@angular2-material/radio/radio';
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';

@Component({
  moduleId: module.id,
  selector: 'ripple-demo',
  templateUrl: 'ripple-demo.html',
  styleUrls: ['ripple-demo.css'],
  providers: [MdUniqueSelectionDispatcher],
  directives: [
      MdButton, MdCard, MdCheckbox, MdIcon, MdInput, MdRadioButton, MdRadioGroup, MdInkRipple,
  ],
})
export class RippleDemo {
  @ViewChild('manualRipple') manualRipple: MdInkRipple;

  centered = false;
  disabled = false;
  unbounded = false;
  rounded = false;
  maxRadius: number = null;
  rippleSpeed = 1;
  rippleColor = '';
  rippleBackgroundColor = '';

  doManualRipple() {
    if (this.manualRipple) {
      window.setTimeout(() => this.manualRipple.start(), 10);
      window.setTimeout(() => this.manualRipple.end(0, 0), 500);
    }
  }
}
