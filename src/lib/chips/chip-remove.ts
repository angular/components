import {Directive, Renderer, ElementRef, OnInit, OnDestroy} from '@angular/core';
import {MdChip} from './chip';
import {Subscription} from 'rxjs';

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
  selector: '[md-chip-remove], [mat-chip-remove], [mdChipRemove], [matChipRemove]',
  host: {
    '[class.mat-chip-remove]': 'true',
    '[class.mat-chip-remove-hidden]': '!_isVisible',
    '(click)': '_handleClick($event)'
  }
})
export class MdChipRemove implements OnInit, OnDestroy {

  /** Whether or not the remove icon is visible. */
  _isVisible: boolean = false;

  /** Subscription for our onRemoveChange Observable */
  _onRemoveChangeSubscription: Subscription;

  constructor(protected _renderer: Renderer, protected _elementRef: ElementRef,
              protected _parentChip: MdChip) {
    if (this._parentChip) {
      this._onRemoveChangeSubscription = this._parentChip.onRemovableChange$
        .subscribe((value: boolean) => {
          this._updateParent(value);
        });
    }
  }

  ngOnInit() {
    this._updateParent(true);
  }

  ngOnDestroy() {
    this._updateParent(false);
    this._onRemoveChangeSubscription.unsubscribe();
  }

  /** Calls the parent chip's public `remove()` method if applicable. */
  _handleClick(event: Event) {
    if (this._parentChip.removable) {
      this._parentChip.remove();
    }
  }

  /** Informs the parent chip whether or not it contains a remove icon. */
  _updateParent(isRemovable: boolean) {
    this._isVisible = isRemovable;
    this._parentChip._setHasRemoveIcon(isRemovable);
  }

}
