import {Directive, Input, HostBinding, HostListener} from '@angular/core';

/**
 * This directive is intended to be used inside an md-menu tag.
 * It exists mostly to set the role attribute.
 */
@Directive({
  selector: 'button[md-menu-item]',
  host: {'role': 'menuitem'}
})
export class MdMenuItem {}

/**
 * This directive is intended to be used inside an md-menu tag.
 * It sets the role attribute and adds support for the disabled property to anchors.
 */
@Directive({
  selector: 'a[md-menu-item]',
  host: {'role': 'menuitem'}
})
export class MdMenuAnchor {
  _disabled: boolean;

  @HostBinding('attr.disabled')
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = (value === false || value === undefined) ? null : true;
  }

  @HostBinding('attr.aria-disabled')
  get isAriaDisabled(): string {
    return this.disabled ? 'true' : 'false';
  }

  @HostBinding('tabIndex')
  get tabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  @HostListener('click', ['$event'])
  checkDisabled(event: any) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
