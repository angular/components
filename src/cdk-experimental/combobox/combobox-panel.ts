/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, TemplateRef} from '@angular/core';
import {Subject} from 'rxjs';

@Directive({
  selector: 'ng-template[cdkComboboxPanel]',
  exportAs: 'cdkComboboxPanel',
  host: {
    'aria-controls': 'contentId',
    'aria-haspopup': 'contentType'
  }

})
export class CdkComboboxPanel<T = unknown> {

  valueUpdated: Subject<T> = new Subject<T>();
  contentId: string = '';
  contentType: string = '';

  constructor(readonly _templateRef: TemplateRef<unknown>) {}

  closePanel(data?: T) {
    this.valueUpdated.next(data);
  }

  _registerContent(contentId: string, contentType: string) {
    this.contentId = contentId;
    if (contentType !== 'listbox' && contentType !== 'dialog') {
      throw Error('CdkComboboxPanel content must be either a listbox or dialog');
    }
    this.contentType = contentType;
  }
}
