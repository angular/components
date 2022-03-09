/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Injector} from '@angular/core';
import {Menu} from './menu-interface';
import {MenuStack} from './menu-stack';

@Injectable()
export class MenuTrigger {
  private _childMenuInjector?: Injector;

  protected childMenu?: Menu;

  constructor(protected injector: Injector, protected menuStack: MenuStack) {}

  protected getChildMenuInjector() {
    this._childMenuInjector =
      this._childMenuInjector ||
      Injector.create({
        providers: [
          {provide: MenuTrigger, useValue: this},
          {provide: MenuStack, useValue: this.menuStack},
        ],
        parent: this.injector,
      });
    return this._childMenuInjector;
  }

  registerChildMenu(child: Menu) {
    this.childMenu = child;
  }
}
