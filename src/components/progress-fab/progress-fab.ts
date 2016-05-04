import {
  Component,
  ChangeDetectionStrategy,
  Renderer,
  ElementRef,
  Input
} from '@angular/core';
import {MdProgressCircle} from '../progress-circle/progress-circle';
import {MdButton} from '../button/button';

@Component({
  selector: '[md-progress-fab]:not(a)',
  templateUrl: './components/progress-fab/progress-fab.html',
  styleUrls: ['./components/progress-fab/progress-fab.css'],
  directives: [MdProgressCircle],
  inputs: ['color'],
  host: {
    '[class.md-button-focus]': 'isKeyboardFocused',
    '(mousedown)': 'setMousedown()',
    '(focus)': 'setKeyboardFocus()',
    '(blur)': 'removeKeyboardFocus()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdProgressFab extends MdButton {

  @Input('mode') progressMode: string = 'indeterminate';
  @Input('value') progressValue: number;
  @Input('progressColor') progressColor: string;

  constructor(elementRef: ElementRef, renderer: Renderer) {
    super(elementRef, renderer);
  }

}
