import {Component} from '@angular/core';
import {Dir} from '@angular/cdk/bidi';
import {Toolbar, ToolbarWidget, ToolbarWidgetGroup} from '@angular/aria/toolbar';
import {
  SimpleCombobox,
  SimpleToolbarButton,
  SimpleToolbarRadioButton,
  SimpleToolbarToggleButton,
} from '../simple-toolbar';

/** @title Basic RTL Toolbar Example */
@Component({
  selector: 'toolbar-rtl-example',
  templateUrl: 'toolbar-rtl-example.html',
  styleUrl: '../toolbar-common.css',
  imports: [
    Dir,
    Toolbar,
    ToolbarWidget,
    ToolbarWidgetGroup,
    SimpleCombobox,
    SimpleToolbarButton,
    SimpleToolbarRadioButton,
    SimpleToolbarToggleButton,
  ],
})
export class ToolbarRtlExample {}
