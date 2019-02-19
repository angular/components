import {Component} from '@angular/core';

/**
 * @title Tab group with scrollable content
 */
@Component({
  selector: 'tab-group-scrollable-example',
  templateUrl: 'tab-group-scrollable-example.html',
  styleUrls: ['tab-group-scrollable-example.css'],
})
export class TabGroupScrollableExample {
  tabs = ['First', 'Second', 'Third'];
  boxes = new Array(100);
}
