import {Component} from '@angular/core';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Listbox with custom typeahead. */
@Component({
  selector: 'cdk-listbox-custom-typeahead-example',
  exportAs: 'cdkListboxCustomTypeaheadExample',
  templateUrl: 'cdk-listbox-custom-typeahead-example.html',
  styleUrls: ['cdk-listbox-custom-typeahead-example.css'],
  standalone: true,
  imports: [CdkListbox, CdkOption],
})
export class CdkListboxCustomTypeaheadExample {}
