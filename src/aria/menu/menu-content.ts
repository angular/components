/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive} from '@angular/core';
import {DeferredContent} from '@angular/aria/private';

/**
 * Defers the rendering of the menu content.
 *
 * This structural directive should be applied to an `ng-template` within a `ngMenu`
 * or `ngMenuBar` to lazily render its content only when the menu is opened.
 *
 * ```html
 * <div ngMenu #myMenu="ngMenu">
 *   <ng-template ngMenuContent>
 *     <div ngMenuItem>Lazy Item 1</div>
 *     <div ngMenuItem>Lazy Item 2</div>
 *   </ng-template>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: 'ng-template[ngMenuContent]',
  exportAs: 'ngMenuContent',
  hostDirectives: [DeferredContent],
})
export class MenuContent {}
