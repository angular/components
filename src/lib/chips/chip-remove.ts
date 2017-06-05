import {Directive, Renderer2, ElementRef, Input, OnInit, OnDestroy} from '@angular/core';
import {MdChip} from './chip';
import {Subscription} from 'rxjs/Subscription';

import {coerceBooleanProperty} from '../core/coercion/boolean-property';

/**
 * Applies proper (click) support and adds styling for use with the Material Design "cancel" icon
 * available at https://material.io/icons/#ic_cancel.
 *
 * Example:
 *
 *     <md-chip>
 *       <md-icon mdChipRemove>clear</md-icon>
 *     </md-chip>
 *
 * You *may* use a custom icon, but you may need to override the `md-chip-remove` positioning styles
 * to properly center the icon within the chip.
 */
@Directive({
  selector: '[mdChipRemove], [matChipRemove]',
  host: {
    'class': 'mat-chip-remove',
    '[class.mat-chip-remove-hidden]': '!visible',
    '(click)': '_handleClick($event)'
  }
})
export class MdChipRemove {

  /** Whether or not the remove icon is visible. */
  _isVisible: boolean = true;

  /** Subscription for our onRemoveChange Observable */
  _onRemoveChangeSubscription: Subscription;

  @Input('mdChipRemoveVisible')
  get visible() { return this._isVisible; }
  set visible(value) {this._isVisible = coerceBooleanProperty(value);}

  constructor(protected _parentChip: MdChip) {}

  /** Calls the parent chip's public `remove()` method if applicable. */
  _handleClick(event: Event) {
    if (this._parentChip.removable) {
      this._parentChip.remove();
    }
  }
}
