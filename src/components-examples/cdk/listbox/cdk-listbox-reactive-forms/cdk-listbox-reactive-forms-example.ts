import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgFor, JsonPipe} from '@angular/common';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Listbox with reactive forms. */
@Component({
  selector: 'cdk-listbox-reactive-forms-example',
  exportAs: 'cdkListboxReactiveFormsExample',
  templateUrl: 'cdk-listbox-reactive-forms-example.html',
  styleUrls: ['cdk-listbox-reactive-forms-example.css'],
  standalone: true,
  imports: [CdkListbox, FormsModule, ReactiveFormsModule, NgFor, CdkOption, JsonPipe],
})
export class CdkListboxReactiveFormsExample {
  languages = ['C++', 'Java', 'JavaScript', 'Python', 'TypeScript'];
  languageCtrl = new FormControl(['TypeScript']);
}
