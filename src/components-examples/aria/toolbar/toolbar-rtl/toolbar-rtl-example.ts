import {Component} from '@angular/core';
import {Dir} from '@angular/cdk/bidi';
import {Toolbar, ToolbarWidget, ToolbarWidgetGroup} from '@angular/aria/toolbar';
import {
  ToolbarCombobox,
  SimpleToolbarButton,
  SimpleToolbarRadioButton,
  SimpleToolbarRadioGroup,
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
    ToolbarCombobox,
    SimpleToolbarButton,
    SimpleToolbarRadioButton,
    SimpleToolbarRadioGroup,
    SimpleToolbarToggleButton,
  ],
})
export class ToolbarRtlExample {}
