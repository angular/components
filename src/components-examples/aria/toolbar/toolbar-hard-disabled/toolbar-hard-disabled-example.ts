import {Component} from '@angular/core';
import {Toolbar, ToolbarWidget, ToolbarWidgetGroup} from '@angular/aria/toolbar';
import {
  SimpleCombobox,
  SimpleToolbarButton,
  SimpleToolbarRadioButton,
  SimpleToolbarToggleButton,
} from '../simple-toolbar';

/** @title Hard Disabled Toolbar Example */
@Component({
  selector: 'toolbar-hard-disabled-example',
  templateUrl: 'toolbar-hard-disabled-example.html',
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
export class ToolbarHardDisabledExample {}
