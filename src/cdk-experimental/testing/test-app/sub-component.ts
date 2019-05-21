import {Component, Input} from '@angular/core';

@Component({
  selector: 'sub',
  template: `
      <h2>List of {{title}}</h2>
      <ul>
        <li *ngFor="let item of items">{{item}}</li>
      </ul>`
})

export class SubComponent {
  // TODO: remove '!'.
  @Input() title!: string;
  // TODO: remove '!'.
  @Input() items!: string[];
}
