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
 * A structural directive that provides a mechanism for lazily rendering the content for an
 * `ngAccordionPanel`.
 *
 * This directive should be applied to an `ng-template` inside an `ngAccordionPanel`.
 * It allows the content of the panel to be lazily rendered, improving performance
 * by only creating the content when the panel is first expanded.
 *
 * ```html
 * <div ngAccordionPanel panelId="unique-id-1">
 *   <ng-template ngAccordionContent>
 *     <p>This is the content that will be displayed inside the panel.</p>
 *   </ng-template>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 * @see [Accordion](guide/aria/accordion)
 */
@Directive({
  selector: 'ng-template[ngAccordionContent]',
  hostDirectives: [DeferredContent],
})
export class AccordionContent {}
