import {Component} from '@angular/core';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Horizontal listbox */
@Component({
  selector: 'cdk-listbox-horizontal-example',
  exportAs: 'cdkListboxhorizontalExample',
  templateUrl: 'cdk-listbox-horizontal-example.html',
  styleUrl: 'cdk-listbox-horizontal-example.css',
  standalone: true,
  imports: [CdkListbox, CdkOption],
})
export class CdkListboxHorizontalExample {
  sizes = ['XS', 'S', 'M', 'L', 'XL'];
}
