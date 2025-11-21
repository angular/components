import {Component} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Toolbar, ToolbarWidget, ToolbarWidgetGroup} from '@angular/aria/toolbar';
import {
  SimpleCombobox,
  SimpleToolbarButton,
  SimpleToolbarRadioButton,
  SimpleToolbarToggleButton,
} from '../simple-toolbar';

/** @title Configurable Aria Toolbar Example */
@Component({
  selector: 'toolbar-configurable-example',
  templateUrl: 'toolbar-configurable-example.html',
  styleUrl: '../toolbar-common.css',
  imports: [
    Toolbar,
    ToolbarWidget,
    ToolbarWidgetGroup,
    SimpleCombobox,
    SimpleToolbarButton,
    SimpleToolbarRadioButton,
    SimpleToolbarToggleButton,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ToolbarConfigurableExample {
  wrap = true;
  softDisabled = true;
  toolbarDisabled = false;
  orientation: 'vertical' | 'horizontal' = 'horizontal';

  widgets = [
    'Undo',
    'Redo',
    'Bold',
    'Italic',
    'Underline',
    'Text style',
    'Align left',
    'Align center',
    'Align right',
    'Checklist',
    'Bullet list',
    'Numbered list',
  ];

  groups = ['Alignment options', 'List options'];

  disabledGroups: string[] = [];
  disabledWidgets: string[] = [];

  isDisabled(value: string) {
    return this.disabledWidgets.includes(value) || this.disabledGroups.includes(value);
  }
}
