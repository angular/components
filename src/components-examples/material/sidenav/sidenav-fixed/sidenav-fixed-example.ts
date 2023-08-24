import {Component} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {NgIf} from '@angular/common';

/** @title Fixed sidenav */
@Component({
  selector: 'sidenav-fixed-example',
  templateUrl: 'sidenav-fixed-example.html',
  styleUrls: ['sidenav-fixed-example.css'],
  standalone: true,
  imports: [
    NgIf,
    MatToolbarModule,
    MatSidenavModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
  ],
})
export class SidenavFixedExample {
  options = this._formBuilder.group({
    bottom: 0,
    fixed: false,
    top: 0,
  });

  constructor(private _formBuilder: FormBuilder) {}

  shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);
}
