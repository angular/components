/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {Tabs} from './tabs';
export {TabList} from './tab-list';
export {Tab} from './tab';
export {TabPanel} from './tab-panel';
export {TabContent} from './tab-content';

// This needs to be re-exported, because it's used by the tab components.
// See: https://github.com/angular/components/issues/30663.
export {
  DeferredContent as ɵɵDeferredContent,
  DeferredContentAware as ɵɵDeferredContentAware,
} from '../private';
