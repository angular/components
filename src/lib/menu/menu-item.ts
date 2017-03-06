import {Component, ElementRef, Input, HostBinding, Renderer} from '@angular/core';
import {Focusable} from '../core/a11y/focus-key-manager';

/**
 * This directive is intended to be used inside an md-menu tag.
 * It exists mostly to set the role attribute.
 */
@Component({
  moduleId: module.id,
  selector: '[md-menu-item], [mat-menu-item]',
  host: {
    'role': 'menuitem',
    '[class.mat-menu-item]': 'true',
    '(click)': '_checkStatus($event)',
    '[attr.tabindex]': '_tabindex',
    '(onMenuClose)': '_closeParentMenu()'
  },
  templateUrl: 'menu-item.html',
  exportAs: 'mdMenuItem'
})
export class MdMenuItem implements Focusable {
  _disabled: boolean;
  private _childMenuOpen: boolean = false;

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  focus(): void {
    this._renderer.invokeElementMethod(this._elementRef.nativeElement, 'focus');
  }

  // this is necessary to support anchors
  /** Whether the menu item is disabled. */
  @HostBinding('attr.disabled')
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = (value === false || value === undefined) ? null : true;
  }

  /** Sets the aria-disabled property on the menu item. */
  @HostBinding('attr.aria-disabled')
  get isAriaDisabled(): string { return String(!!this.disabled); }
  get _tabindex() { return this.disabled ? '-1' : '0'; }

  /** For child menu triggers */
  @Input() childMenuTrigger: boolean = false;

  _getHostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  _checkStatus(event: Event) {
    if (this.disabled || this.childMenuTrigger) {
      this._childMenuOpen = this.childMenuTrigger;
      event.preventDefault();
      event.stopPropagation();
    }
  }

  _closeParentMenu() {
    if (this._childMenuOpen) {
      const menuElement = this._getHostElement().closest('.mat-menu-panel');
      this._renderer.invokeElementMethod(
        menuElement,
        'dispatchEvent',
        [ new MouseEvent('click', { bubbles: true}) ]
      );
    }
  }
}
