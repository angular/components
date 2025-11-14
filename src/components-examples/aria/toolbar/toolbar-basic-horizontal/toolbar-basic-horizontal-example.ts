import {Component} from '@angular/core';
import {Toolbar, ToolbarWidgetGroup} from '@angular/aria/toolbar';
import {SimpleToolbarButton} from '../simple-toolbar';

/** @title Basic Horizontal Toolbar Example */
@Component({
  selector: 'toolbar-basic-horizontal-example',
  templateUrl: 'toolbar-basic-horizontal-example.html',
  styleUrl: '../retro-toolbar.css',
  imports: [Toolbar, ToolbarWidgetGroup, SimpleToolbarButton],
})
export class ToolbarBasicHorizontalExample {}
