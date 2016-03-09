import {
  Component,
  ElementRef,
  ViewEncapsulation,
  Input,
  HostBinding,
  HostListener,
  ChangeDetectionStrategy,
  Renderer,
} from 'angular2/core';

import {TimerWrapper} from 'angular2/src/facade/async';

// TODO(jelbourn): Ink ripples.
// TODO(jelbourn): Make the `isMouseDown` stuff done with one global listener.
// TODO(kara): Convert attribute selectors to classes when attr maps become available


@Component({
  selector: '[md-button]:not(a), [md-raised-button]:not(a), [md-fab]:not(a), [md-mini-fab]:not(a)',
  inputs: ['color'],
  host: {
    '[class.md-button-focus]': 'isKeyboardFocused',
    '(mousedown)': 'setMousedown()',
    '(focus)': 'setKeyboardFocus()',
    '(blur)': 'removeKeyboardFocus()'
  },
  templateUrl: './components/button/button.html',
  styleUrls: ['./components/button/button.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdButton {
  private color_: string;

  // Setting the class when a color property is provided
  // cannot be done through [ngClass] on host or [class] = 'getClassList()'
  // @see http://stackoverflow.com/questions/35506395
  @Input()
  set color(value: string) {
    // Remove the previous color if one provided
    if (this.color_ != null) {
      this.renderer.setElementClass(this.elementRef, 'md-' + this.color_, false);
    }

    this.color_ = value;

    if (value != null) {
      this.renderer.setElementClass(this.elementRef, 'md-' + this.color_, true);
    }
  }

  get color(): string {
    return this.color_;
  }

  constructor(public elementRef: ElementRef, public renderer: Renderer) {
  }

  /** Whether the button has focus from the keyboard (not the mouse). Used for class binding. */
  isKeyboardFocused: boolean = false;

  /** Whether a mousedown has occurred on this element in the last 100ms. */
  isMouseDown: boolean = false;

  setMousedown() {
    // We only *show* the focus style when focus has come to the button via the keyboard.
    // The Material Design spec is silent on this topic, and without doing this, the
    // button continues to look :active after clicking.
    // @see http://marcysutton.com/button-focus-hell/
    this.isMouseDown = true;
    TimerWrapper.setTimeout(() => {
      this.isMouseDown = false;
    }, 100);
  }

  setKeyboardFocus($event: any) {
    this.isKeyboardFocused = !this.isMouseDown;
  }

  removeKeyboardFocus() {
    this.isKeyboardFocused = false;
  }
}

@Component({
  selector: 'a[md-button], a[md-raised-button], a[md-fab], a[md-mini-fab]',
  inputs: ['color'],
  host: {
    '[class.md-button-focus]': 'isKeyboardFocused',
    '(mousedown)': 'setMousedown()',
    '(focus)': 'setKeyboardFocus()',
    '(blur)': 'removeKeyboardFocus()'
  },
  templateUrl: './components/button/button.html',
  styleUrls: ['./components/button/button.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdAnchor extends MdButton {
  disabled_: boolean = null;

  constructor(elementRef_: ElementRef, renderer_: Renderer) {
    super(elementRef_, renderer_);
  }

  @HostBinding('tabIndex')
  get tabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  @HostBinding('attr.aria-disabled')
  /** Gets the aria-disabled value for the component, which must be a string for Dart. */
  get isAriaDisabled(): string {
    return this.disabled ? 'true' : 'false';
  }

  @HostBinding('attr.disabled')
  @Input('disabled')
  get disabled() {
    return this.disabled_;
  }

  set disabled(value: boolean) {
    // The presence of *any* disabled value makes the component disabled, *except* for false.
    this.disabled_ = (value != null && value != false) ? true : null;
  }

  @HostListener('click', ['$event'])
  haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
