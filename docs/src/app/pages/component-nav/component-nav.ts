/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {MatListItem, MatNavList} from '@angular/material/list';
import {ActivatedRoute, RouterLinkActive, RouterLink} from '@angular/router';
import {of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {DocumentationItems} from '../../shared/documentation-items/documentation-items';

@Component({
  selector: 'app-component-nav',
  templateUrl: './component-nav.html',
  imports: [MatNavList, MatListItem, RouterLinkActive, RouterLink, AsyncPipe],
})
export class ComponentNav {
  private _docItems = inject(DocumentationItems);
  private _route = inject(ActivatedRoute);
  protected _params = this._route.params;

  items = this._params.pipe(
    switchMap(params => (params?.section ? this._docItems.getItems(params.section) : of([]))),
  );
}
