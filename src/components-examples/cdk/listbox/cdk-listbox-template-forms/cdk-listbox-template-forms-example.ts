import {Component} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Listbox with template-driven forms. */
@Component({
  selector: 'cdk-listbox-template-forms-example',
  exportAs: 'cdkListboxTemplateFormsExample',
  templateUrl: 'cdk-listbox-template-forms-example.html',
  styleUrl: 'cdk-listbox-template-forms-example.css',
  standalone: true,
  imports: [CdkListbox, FormsModule, CdkOption, JsonPipe],
})
export class CdkListboxTemplateFormsExample {
  toppings = ['Extra Cheese', 'Mushrooms', 'Pepperoni', 'Sausage'];
  order: readonly string[] = [];
}
