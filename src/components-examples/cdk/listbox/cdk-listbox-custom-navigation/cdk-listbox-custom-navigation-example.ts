import {Component} from '@angular/core';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Listbox with custom keyboard navigation options. */
@Component({
  selector: 'cdk-listbox-custom-navigation-example',
  exportAs: 'cdkListboxCustomNavigationExample',
  templateUrl: 'cdk-listbox-custom-navigation-example.html',
  styleUrl: 'cdk-listbox-custom-navigation-example.css',
  imports: [CdkListbox, CdkOption],
})
export class CdkListboxCustomNavigationExample {}
