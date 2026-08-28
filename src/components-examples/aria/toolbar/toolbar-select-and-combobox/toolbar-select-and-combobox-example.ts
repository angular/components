import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Toolbar, ToolbarWidget, ToolbarWidgetGroup} from '@angular/aria/toolbar';
import {
  ToolbarCombobox,
  SimpleToolbarButton,
  SimpleToolbarRadioButton,
  SimpleToolbarRadioGroup,
  SimpleToolbarToggleButton,
} from '../simple-toolbar';

/** @title Toolbar with Select, Combobox, and Spinbutton Example */
@Component({
  selector: 'toolbar-select-and-combobox-example',
  templateUrl: 'toolbar-select-and-combobox-example.html',
  styleUrl: '../toolbar-common.css',
  imports: [
    FormsModule,
    Toolbar,
    ToolbarWidget,
    ToolbarWidgetGroup,
    ToolbarCombobox,
    SimpleToolbarButton,
    SimpleToolbarRadioButton,
    SimpleToolbarRadioGroup,
    SimpleToolbarToggleButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarSelectAndComboboxExample {
  readonly selectedFont = signal('sans-serif');
  readonly fontSize = signal(16);
  readonly alignment = signal('align left');
}
