import {Component, viewChild} from '@angular/core';
import {Menu, MenuBar, MenuContent, MenuItem} from '@angular/aria/menu';
import {OverlayModule} from '@angular/cdk/overlay';

/** @title Menu bar disabled example. */
@Component({
  selector: 'menubar-disabled-example',
  templateUrl: 'menubar-disabled-example.html',
  styleUrl: '../menubar.css',
  imports: [Menu, MenuBar, MenuItem, MenuContent, OverlayModule],
})
export class MenuBarDisabledExample {
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
