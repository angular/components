import {Dir} from '@angular/cdk/bidi';
import {Component, viewChild} from '@angular/core';
import {Menu, MenuBar, MenuContent, MenuItem} from '@angular/aria/menu';
import {OverlayModule} from '@angular/cdk/overlay';

/** @title Menu bar RTL example. */
@Component({
  selector: 'menubar-rtl-example',
  templateUrl: 'menubar-rtl-example.html',
  styleUrl: '../menubar.css',
  imports: [Dir, Menu, MenuBar, MenuItem, MenuContent, OverlayModule],
})
export class MenuBarRTLExample {
  fileMenu = viewChild<Menu<string>>('fileMenu');
  shareMenu = viewChild<Menu<string>>('shareMenu');
  editMenu = viewChild<Menu<string>>('editMenu');
  viewMenu = viewChild<Menu<string>>('viewMenu');
  insertMenu = viewChild<Menu<string>>('insertMenu');
  imageMenu = viewChild<Menu<string>>('imageMenu');
  chartMenu = viewChild<Menu<string>>('chartMenu');
  formatMenu = viewChild<Menu<string>>('formatMenu');
  textMenu = viewChild<Menu<string>>('textMenu');
  sizeMenu = viewChild<Menu<string>>('sizeMenu');
  paragraphMenu = viewChild<Menu<string>>('paragraphMenu');
  alignMenu = viewChild<Menu<string>>('alignMenu');
}
