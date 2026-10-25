import {Component, viewChild} from '@angular/core';
import {Menu, MenuBar, MenuContent, MenuItem} from '@angular/aria/menu';
import {OverlayModule} from '@angular/cdk/overlay';

/** @title Menu bar typeahead example. */
@Component({
  selector: 'menubar-typeahead-example',
  templateUrl: 'menubar-typeahead-example.html',
  styleUrl: '../menubar.css',
  imports: [Menu, MenuBar, MenuItem, MenuContent, OverlayModule],
})
export class MenuBarTypeaheadExample {
  fruitsMenu = viewChild<Menu<string>>('fruitsMenu');
  citrusMenu = viewChild<Menu<string>>('citrusMenu');
  vegetablesMenu = viewChild<Menu<string>>('vegetablesMenu');
  leafyMenu = viewChild<Menu<string>>('leafyMenu');
  grainsMenu = viewChild<Menu<string>>('grainsMenu');
  drinksMenu = viewChild<Menu<string>>('drinksMenu');
}
