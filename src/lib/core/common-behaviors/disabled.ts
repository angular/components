import {Directive, SkipSelf, Optional} from '@angular/core';
import {mixinDisabled, CanDisable} from './mixin-disabled';

/** @docs-private */
export class MdDisabledBase { }
export const _MdDisabledMixinBase = mixinDisabled(MdDisabledBase);

/**
 * Wrapper around the native `disabled` attribute.
 * Used to set up the `disabled` fieldset inheritance.
 * @docs-private
 */
@Directive({
  selector: '[disabled]',
  inputs: ['disabled'],
  host: {
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled',
  }
})
export class MdDisabled extends _MdDisabledMixinBase implements CanDisable {
  constructor(@SkipSelf() @Optional() parent?: MdDisabled) {
    super();
    this.withDisabledParent(parent);
  }
}
