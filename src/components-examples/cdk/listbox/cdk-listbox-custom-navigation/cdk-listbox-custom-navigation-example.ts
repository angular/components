import {Component} from '@angular/core';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Listbox with custom keyboard navigation options. */
@Component({
  selector: 'cdk-listbox-custom-navigation-example',
  exportAs: 'cdkListboxCustomNavigationExample',
  templateUrl: 'cdk-listbox-custom-navigation-example.html',
  styleUrls: ['cdk-listbox-custom-navigation-example.css'],
  standalone: true,
  imports: [CdkListbox, CdkOption],
})
export class CdkListboxCustomNavigationExample {}
