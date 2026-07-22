import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Basic use of the tab nav bar
 */
@Component({
  selector: 'tab-nav-bar-basic-example',
  templateUrl: 'tab-nav-bar-basic-example.html',
  styleUrl: 'tab-nav-bar-basic-example.css',
  imports: [MatTabsModule, MatButtonModule],
})
export class TabNavBarBasicExample {
  links = ['First', 'Second', 'Third'];
  activeLink = this.links[0];

  addLink() {
    this.links.push(`Link ${this.links.length + 1}`);
  }
}
