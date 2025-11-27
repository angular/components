import {TitleCasePipe} from '@angular/common';
import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';

/**
 * @title Navigation list
 */
@Component({
  selector: 'list-navigation-example',
  templateUrl: 'list-navigation-example.html',
  imports: [MatListModule, MatIconModule, TitleCasePipe],
})
export class ListNavigationExample {
  fragments = ['inbox', 'outbox', 'drafts'];
  activeLink: string | null = null;
}
