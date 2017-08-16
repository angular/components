import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {TableOfContents} from './table-of-contents';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [TableOfContents],
  exports: [TableOfContents],
  entryComponents: [TableOfContents],
})
export class TableOfContentsModule { }
