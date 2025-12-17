/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive} from '@angular/core';
import {DeferredContent} from '../private';

/**
 * A structural directive that marks the `ng-template` to be used as the popup
 * for a combobox. This content is conditionally rendered.
 *
 * The content of the popup can be a `ngListbox`, `ngTree`, or `role="dialog"`, allowing for
 * flexible and complex combobox implementations. The consumer is responsible for
 * implementing the filtering logic based on the `ngComboboxInput`'s value.
 *
 * ```html
 * <ng-template ngComboboxPopupContainer>
 *   <div ngListbox [(value)]="selectedValue">
 *     <!-- ... options ... -->
 *   </div>
 * </ng-template>
 * ```
 *
 * When using CdkOverlay, this directive can be replaced by `cdkConnectedOverlay`.
 *
 * ```html
 * <ng-template
 *     [cdkConnectedOverlay]="{origin: inputElement, usePopover: 'inline' matchWidth: true}"
 *     [cdkConnectedOverlayOpen]="combobox.expanded()">
 *   <div ngListbox [(value)]="selectedValue">
 *     <!-- ... options ... -->
 *   </div>
 * </ng-template>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Combobox](guide/aria/combobox)
 * @see [Select](guide/aria/select)
 * @see [Multiselect](guide/aria/multiselect)
 * @see [Autocomplete](guide/aria/autocomplete)
 */
@Directive({
  selector: 'ng-template[ngComboboxPopupContainer]',
  exportAs: 'ngComboboxPopupContainer',
  hostDirectives: [DeferredContent],
})
export class ComboboxPopupContainer {}
