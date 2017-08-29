/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule} from '@angular/core';
import {PlatformModule} from '../platform';
import {MediaQueryManager} from './media-query-manager';
import {MediaMatcher} from './media-matcher';

@NgModule({
  providers: [MediaQueryManager, MediaMatcher],
  imports: [PlatformModule],
})
export class MediaQueryModule {}


export {MediaQueryManager, MediaChange} from './media-query-manager';
export {MediaMatcher} from './media-matcher';
export {MEDIA_QUERIES} from './queries';
