import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Listbox with disabled options. */
@Component({
  selector: 'cdk-listbox-disabled-example',
  exportAs: 'cdkListboxDisabledExample',
  templateUrl: 'cdk-listbox-disabled-example.html',
  styleUrls: ['cdk-listbox-disabled-example.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CdkListbox, CdkOption],
})
export class CdkListboxDisabledExample {
  canDrinkCtrl = new FormControl(false);
}
