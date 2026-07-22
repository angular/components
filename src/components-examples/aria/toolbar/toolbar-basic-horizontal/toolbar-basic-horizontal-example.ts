import {Component} from '@angular/core';
import {Toolbar, ToolbarWidget, ToolbarWidgetGroup} from '@angular/aria/toolbar';
import {
  SimpleCombobox,
  SimpleToolbarButton,
  SimpleToolbarRadioButton,
  SimpleToolbarToggleButton,
} from '../simple-toolbar';

/** @title Basic Horizontal Toolbar Example */
@Component({
  selector: 'toolbar-basic-horizontal-example',
  templateUrl: 'toolbar-basic-horizontal-example.html',
  styleUrl: '../toolbar-common.css',
  imports: [
    Toolbar,
    ToolbarWidget,
    ToolbarWidgetGroup,
    SimpleCombobox,
    SimpleToolbarButton,
    SimpleToolbarRadioButton,
    SimpleToolbarToggleButton,
  ],
})
export class ToolbarBasicHorizontalExample {}
