import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {CopyToClipboard} from './copy_to_clipboard';

@NgModule({declarations: [CopyToClipboard], imports: [CommonModule], exports: [CopyToClipboard]})
export class ClipboardModule {
}
