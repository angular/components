import {Component} from '@angular/core';
import {MatListModule} from '@angular/material/list';

/**
 * @title Action list
 */
@Component({
  selector: 'list-action-example',
  templateUrl: 'list-action-example.html',
  imports: [MatListModule],
})
export class ListActionExample {
  action(task: string) {
    window.alert(task);
  }
}
