import {Component, signal, ViewEncapsulation} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {form, FormField} from '@angular/forms/signals';

/**
 * @title Select with custom panel styling (signal forms)
 */
@Component({
  selector: 'select-panel-class-signal-form-example',
  templateUrl: 'select-panel-class-signal-form-example.html',
  styleUrl: 'select-panel-class-signal-form-example.css',
  // Encapsulation has to be disabled in order for the
  // component style to apply to the select panel.
  encapsulation: ViewEncapsulation.None,
  imports: [MatFormFieldModule, MatSelectModule, FormField],
})
export class SelectPanelClassSignalFormExample {
  protected panelColor = form(signal('red'));
}
