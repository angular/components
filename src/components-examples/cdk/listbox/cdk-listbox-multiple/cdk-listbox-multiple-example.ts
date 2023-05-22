import {Component} from '@angular/core';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Listbox with multiple selection. */
@Component({
  selector: 'cdk-listbox-multiple-example',
  exportAs: 'cdkListboxMultipleExample',
  templateUrl: 'cdk-listbox-multiple-example.html',
  styleUrls: ['cdk-listbox-multiple-example.css'],
  standalone: true,
  imports: [CdkListbox, CdkOption],
})
export class CdkListboxMultipleExample {}
