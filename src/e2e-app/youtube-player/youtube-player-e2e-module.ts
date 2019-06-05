/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {NgModule} from '@angular/core';
import {YouTubePlayerModule} from '@angular/youtube-player';
import {YouTubePlayerE2E} from './youtube-player-e2e';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    YouTubePlayerModule,
  ],
  declarations: [YouTubePlayerE2E],
})
export class YouTubePlayerE2eModule {
}
