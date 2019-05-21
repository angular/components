import {Component, HostBinding, HostListener} from '@angular/core';

@Component({
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
      `
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
  @HostBinding('class.hovering') private isHovering!: boolean;

  @HostListener('mouseenter')
  onMouseOver() {
    this.isHovering = true;
  }

  @HostListener('mouseout')
  onMouseOut() {
    this.isHovering = false;
  }
  constructor() {
    console.log('Ng2Component instantiated.');
    this.username = 'Yi';
    this.counter = 0;
    this.asyncCounter = 0;
    this.memo = '';
    this.testTools = ['Protractor', 'TestBed', 'Other'];
    this.testMethods = ['Unit Test', 'Integration Test', 'Performance Test'];
    setTimeout(() => {
      this.asyncCounter = 5;
    }, 1000);
  }
  click() {
    this.counter++;
    setTimeout(() => {
      this.asyncCounter++;
    }, 500);
  }
}
