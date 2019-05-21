/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation
} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'main',
  template: `
      <h1 style="height:50px">Main Component</h1>
      <div id = 'username'>Hello {{username}} from Angular 2!</div>
      <button (click)='click()'>Up</button><br>
      <label>Count:</label>
      <div id = 'counter'>{{counter}}</div>
      <label>AsyncCounter:</label>
      <div id = 'asyncCounter'>{{asyncCounter}}</div>
      <input [(ngModel)]='input' placeholder='' id = 'input'>
      <div id = 'value'>Input:{{input}}</div>
      <textarea id = 'memo'>{{memo}}</textarea>
      <sub title = 'test tools' [items] = testTools></sub>
      <sub title = 'test methods' [items] = testMethods></sub>
      `,
  host: {
    '[class.hovering]': '_isHovering',
    '(mouseenter)': 'onMouseOver()',
    '(mouseout)': 'onMouseOut()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MainComponent {
  username: string;
  counter: number;
  asyncCounter: number;
  // TODO: remove '!'.
  input!: string;
  memo: string;
  testTools: string[];
  testMethods: string[];
  // TODO: remove '!'.
  _isHovering!: boolean;

  onMouseOver() {
    this._isHovering = true;
  }

  onMouseOut() {
    this._isHovering = false;
  }

  constructor(private _cdr: ChangeDetectorRef) {
    console.log('Ng2Component instantiated.');
    this.username = 'Yi';
    this.counter = 0;
    this.asyncCounter = 0;
    this.memo = '';
    this.testTools = ['Protractor', 'TestBed', 'Other'];
    this.testMethods = ['Unit Test', 'Integration Test', 'Performance Test'];
    setTimeout(() => {
      this.asyncCounter = 5;
      this._cdr.markForCheck();
    }, 1000);
  }

  click() {
    this.counter++;
    setTimeout(() => {
      this.asyncCounter++;
      this._cdr.markForCheck();
    }, 500);
  }
}
