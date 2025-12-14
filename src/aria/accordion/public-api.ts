/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {AccordionPanel} from './accordion-panel';
export {AccordionGroup} from './accordion-group';
export {AccordionTrigger} from './accordion-trigger';
export {AccordionContent} from './accordion-content';

// This needs to be re-exported, because it's used by the accordion components.
// See: https://github.com/angular/components/issues/30663.
export {DeferredContent as ɵɵDeferredContent} from '../private';
