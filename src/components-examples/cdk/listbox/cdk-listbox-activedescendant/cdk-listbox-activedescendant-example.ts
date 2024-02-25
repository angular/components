import {Component} from '@angular/core';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Listbox with aria-activedescendant. */
@Component({
  selector: 'cdk-listbox-activedescendant-example',
  exportAs: 'cdkListboxActivedescendantExample',
  templateUrl: 'cdk-listbox-activedescendant-example.html',
  styleUrl: 'cdk-listbox-activedescendant-example.css',
  standalone: true,
  imports: [CdkListbox, CdkOption],
})
export class CdkListboxActivedescendantExample {
  features = ['Hydrodynamic', 'Port & Starboard Attachments', 'Turbo Drive'];
}
