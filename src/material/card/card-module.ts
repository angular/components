/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {BidiModule} from '@angular/cdk/bidi';
import {
  MatCard,
  MatCardActions,
  MatCardAvatar,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardImage,
  MatCardLgImage,
  MatCardMdImage,
  MatCardSmImage,
  MatCardSubtitle,
  MatCardTitle,
  MatCardTitleGroup,
  MatCardXlImage,
} from './card';

const CARD_DIRECTIVES = [
  MatCard,
  MatCardActions,
  MatCardAvatar,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardImage,
  MatCardLgImage,
  MatCardMdImage,
  MatCardSmImage,
  MatCardSubtitle,
  MatCardTitle,
  MatCardTitleGroup,
  MatCardXlImage,
];

@NgModule({
  imports: CARD_DIRECTIVES,
  exports: [CARD_DIRECTIVES, BidiModule],
})
export class MatCardModule {}
