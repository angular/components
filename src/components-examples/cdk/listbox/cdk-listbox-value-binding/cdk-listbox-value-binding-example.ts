import {Component} from '@angular/core';
import {NgFor, JsonPipe} from '@angular/common';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Listbox with value binding. */
@Component({
  selector: 'cdk-listbox-value-binding-example',
  exportAs: 'cdkListboxValueBindingExample',
  templateUrl: 'cdk-listbox-value-binding-example.html',
  styleUrls: ['cdk-listbox-value-binding-example.css'],
  standalone: true,
  imports: [CdkListbox, NgFor, CdkOption, JsonPipe],
})
export class CdkListboxValueBindingExample {
  starters = ['Sprigatito', 'Fuecoco', 'Quaxly'];
  starter: readonly string[] = ['Fuecoco'];

  reset() {
    this.starter = ['Fuecoco'];
  }
}
