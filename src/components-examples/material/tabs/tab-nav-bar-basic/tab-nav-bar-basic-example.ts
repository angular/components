import {Component, linkedSignal, signal} from '@angular/core';
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
  links = signal(['Link 1', 'Link 2', 'Link 3']);
  activeLink = linkedSignal(() => this.links()[0]);

  addLink() {
    this.links.update(current => [...current, `Link ${current.length + 1}`]);
  }
}
