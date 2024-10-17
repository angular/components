import {Component} from '@angular/core';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Listbox with multiple selection. */
@Component({
  selector: 'cdk-listbox-multiple-example',
  exportAs: 'cdkListboxMultipleExample',
  templateUrl: 'cdk-listbox-multiple-example.html',
  styleUrl: 'cdk-listbox-multiple-example.css',
  imports: [CdkListbox, CdkOption],
})
export class CdkListboxMultipleExample {}
