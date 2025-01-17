/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkAccordionModule} from '@angular/cdk/accordion';
import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {
  MatAccordion,
  MatAccordionDisplayMode,
  MatAccordionTogglePosition,
  MatExpansionModule,
} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  selector: 'expansion-demo',
  styleUrl: 'expansion-demo.css',
  templateUrl: 'expansion-demo.html',
  imports: [
    CdkAccordionModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSlideToggleModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionDemo {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  displayMode: MatAccordionDisplayMode = 'default';
  multi = false;
  hideToggle = false;
  disabled = false;
  showPanel3 = true;
  togglePosition: MatAccordionTogglePosition = 'after';
  expandedHeight: string;
  collapsedHeight: string;
  events: string[] = [];

  addEvent(eventName: string) {
    this.events.push(`${eventName} - ${new Date().toISOString()}`);
  }
}
