import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  Renderer,
  ViewEncapsulation
} from '@angular/core';
import {coerceBooleanProperty, FocusOriginMonitor} from '../core';
import {MdThemeable} from '../core/style/themeable';


// TODO(kara): Convert attribute selectors to classes when attr maps become available


/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'button[md-button], button[mat-button], a[md-button], a[mat-button]',
  host: {
    '[class.mat-button]': 'true'
  }
})
export class MdButtonCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector:
      'button[md-raised-button], button[mat-raised-button], ' +
      'a[md-raised-button], a[mat-raised-button]',
  host: {
    '[class.mat-raised-button]': 'true'
  }
})
export class MdRaisedButtonCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector:
      'button[md-icon-button], button[mat-icon-button], a[md-icon-button], a[mat-icon-button]',
  host: {
    '[class.mat-icon-button]': 'true',
  }
})
export class MdIconButtonCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'button[md-fab], button[mat-fab], a[md-fab], a[mat-fab]',
  host: {
    '[class.mat-fab]': 'true'
  }
})
export class MdFabCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'button[md-mini-fab], button[mat-mini-fab], a[md-mini-fab], a[mat-mini-fab]',
  host: {
    '[class.mat-mini-fab]': 'true'
  }
})
export class MdMiniFabCssMatStyler {}


/**
 * Material design button.
 */
@Component({
  moduleId: module.id,
  selector: 'button[md-button], button[md-raised-button], button[md-icon-button],' +
            'button[md-fab], button[md-mini-fab],' +
            'button[mat-button], button[mat-raised-button], button[mat-icon-button],' +
            'button[mat-fab], button[mat-mini-fab]',
  host: {
    '[disabled]': 'disabled',
  },
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdButton extends MdThemeable implements OnDestroy {

  /** Whether the button is round. */
  _isRoundButton: boolean = ['icon-button', 'fab', 'mini-fab'].some(suffix => {
    let el = this._getHostElement();
    return el.hasAttribute('md-' + suffix) || el.hasAttribute('mat-' + suffix);
  });

  /** Whether the ripple effect on click should be disabled. */
  private _disableRipple: boolean = false;
  private _disabled: boolean = null;

  /** Whether the ripple effect for this button is disabled. */
  @Input()
  get disableRipple() { return this._disableRipple; }
  set disableRipple(v) { this._disableRipple = coerceBooleanProperty(v); }

  /** Whether the button is disabled. */
  @Input()
  get disabled() { return this._disabled; }
  set disabled(value: boolean) { this._disabled = coerceBooleanProperty(value) ? true : null; }

  constructor(private _focusOriginMonitor: FocusOriginMonitor, elementRef: ElementRef,
              renderer: Renderer) {
    super(renderer, elementRef);
    this._focusOriginMonitor.monitor(elementRef.nativeElement, renderer, true);
  }

  ngOnDestroy() {
    this._focusOriginMonitor.unmonitor(this._elementRef.nativeElement);
  }

  /** Focuses the button. */
  focus(): void {
    this._renderer.invokeElementMethod(this._getHostElement(), 'focus');
  }

  _getHostElement() {
    return this._elementRef.nativeElement;
  }

  _isRippleDisabled() {
    return this.disableRipple || this.disabled;
  }
}

/**
 * Raised Material design button.
 */
@Component({
  moduleId: module.id,
  selector: `a[md-button], a[md-raised-button], a[md-icon-button], a[md-fab], a[md-mini-fab],
             a[mat-button], a[mat-raised-button], a[mat-icon-button], a[mat-fab], a[mat-mini-fab]`,
  host: {
    '[attr.disabled]': 'disabled',
    '[attr.aria-disabled]': '_isAriaDisabled',
    '(click)': '_haltDisabledEvents($event)',
  },
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdAnchor extends MdButton {
  constructor(elementRef: ElementRef, renderer: Renderer, focusOriginMonitor: FocusOriginMonitor) {
    super(focusOriginMonitor, elementRef, renderer);
  }

  /** @docs-private */
  @HostBinding('tabIndex')
  get tabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  get _isAriaDisabled(): string {
    return this.disabled ? 'true' : 'false';
  }

  _haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
