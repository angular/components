import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'home',
  template: `<p>Welcome to the e2e tests app</p>`,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Home {}
