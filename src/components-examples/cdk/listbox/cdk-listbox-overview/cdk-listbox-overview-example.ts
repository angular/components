import {Component} from '@angular/core';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Basic listbox. */
@Component({
  selector: 'cdk-listbox-overview-example',
  exportAs: 'cdkListboxOverviewExample',
  templateUrl: 'cdk-listbox-overview-example.html',
  styleUrl: 'cdk-listbox-overview-example.css',
  imports: [CdkListbox, CdkOption],
})
export class CdkListboxOverviewExample {}
