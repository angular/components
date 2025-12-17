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
 * A TabContent container for the lazy-loaded content.
 *
 * This structural directive should be applied to an `ng-template` within an `ngTabPanel`.
 * It enables lazy loading of the tab's content, meaning the content is only rendered
 * when the tab is activated for the first time.
 *
 * ```html
 * <div ngTabPanel value="myTabId">
 *   <ng-template ngTabContent>
 *     <p>This content will be loaded when 'myTabId' is selected.</p>
 *   </ng-template>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Tabs](guide/aria/tabs)
 */
@Directive({
  selector: 'ng-template[ngTabContent]',
  exportAs: 'ngTabContent',
  hostDirectives: [DeferredContent],
})
export class TabContent {}
