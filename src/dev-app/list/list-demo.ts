/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule, MatListOptionTogglePosition} from '@angular/material/list';
import {ActivatedRoute} from '@angular/router';

interface Link {
  name: string;
  href: string;
}
interface Shoes {
  value: string;
  name: string;
}

@Component({
  selector: 'list-demo',
  templateUrl: 'list-demo.html',
  styleUrl: 'list-demo.css',
  standalone: true,
  imports: [
    JsonPipe,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListDemo {
  items: string[] = ['Pepper', 'Salt', 'Paprika'];

  form: FormGroup;
  shoes: Shoes[] = [
    {value: 'boots', name: 'Boots'},
    {value: 'clogs', name: 'Clogs'},
    {value: 'loafers', name: 'Loafers'},
    {value: 'moccasins', name: 'Moccasins'},
    {value: 'sneakers', name: 'Sneakers'},
  ];
  shoesControl = new FormControl();

  togglePosition: MatListOptionTogglePosition = 'before';

  contacts: {name: string; headline: string}[] = [
    {name: 'Nancy', headline: 'Software engineer'},
    {name: 'Mary', headline: 'TPM'},
    {name: 'Bobby', headline: 'UX designer'},
  ];

  messages: {from: string; subject: string; message: string; image: string}[] = [
    {
      from: 'John',
      subject: 'Brunch?',
      message: 'Did you want to go on Sunday? I was thinking that might work.',
      image: 'https://angular.io/generated/images/bios/devversion.jpg',
    },
    {
      from: 'Mary',
      subject: 'Summer BBQ',
      message: 'Wish I could come, but I have some prior obligations.',
      image: 'https://angular.io/generated/images/bios/twerske.jpg',
    },
    {
      from: 'Bobby',
      subject: 'Oui oui',
      message: 'Do you have Paris reservations for the 15th? I just booked!',
      image: 'https://angular.io/generated/images/bios/jelbourn.jpg',
    },
  ];

  links: Link[] = [
    {name: 'Inbox', href: '/list#inbox'},
    {name: 'Outbox', href: '/list#outbox'},
    {name: 'Spam', href: '/list#spam'},
    {name: 'Trash', href: '/list#trash'},
  ];

  thirdLine = false;
  showBoxes = false;
  infoClicked = false;
  selectionListDisabled = false;
  selectionListRippleDisabled = false;
  selectionListSingleSelectionIndicatorHidden = false;

  selectedOptions: string[] = ['apples'];
  changeEventCount = 0;
  modelChangeEventCount = 0;

  readonly cdr = inject(ChangeDetectorRef);
  readonly activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.activatedRoute.url.subscribe(() => {
      this.cdr.markForCheck();
    });

    this.form = new FormGroup({
      shoes: this.shoesControl,
    });
  }

  onSelectedOptionsChange(values: string[]) {
    this.selectedOptions = values;
    this.modelChangeEventCount++;
  }

  toggleCheckboxPosition() {
    this.togglePosition = this.togglePosition === 'before' ? 'after' : 'before';
  }

  favoriteOptions: string[] = [];

  alertItem(msg: string) {
    alert(msg);
  }

  isActivated(link: Link) {
    return `${window.location.pathname}${window.location.hash}` === link.href;
  }
}
