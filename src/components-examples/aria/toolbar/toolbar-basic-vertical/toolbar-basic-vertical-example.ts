import {Component} from '@angular/core';
import {Toolbar, ToolbarWidget, ToolbarWidgetGroup} from '@angular/aria/toolbar';
import {
  SimpleToolbarButton,
  SimpleToolbarRadioButton,
  SimpleToolbarRadioGroup,
  SimpleToolbarToggleButton,
} from '../simple-toolbar';

/** @title Basic Vertical Toolbar Example */
@Component({
  selector: 'toolbar-basic-vertical-example',
  templateUrl: 'toolbar-basic-vertical-example.html',
  styleUrl: '../toolbar-common.css',
  imports: [
    Toolbar,
    ToolbarWidget,
    ToolbarWidgetGroup,
    SimpleToolbarButton,
    SimpleToolbarRadioButton,
    SimpleToolbarRadioGroup,
    SimpleToolbarToggleButton,
  ],
})
export class ToolbarBasicVerticalExample {}
