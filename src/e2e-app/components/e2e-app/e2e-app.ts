import {Component, ViewEncapsulation} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'e2e-app',
  templateUrl: 'e2e-app.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatListModule, NgIf, NgFor, RouterLink, RouterOutlet],
})
export class E2eApp {
  showLinks = false;

  navLinks = [
    {path: 'block-scroll-strategy', title: 'Block Scroll Strategy'},
    {path: 'component-harness', title: 'Component Harness'},
    {path: 'slider', title: 'Slider'},
    {path: 'virtual-scroll', title: 'Virtual Scroll'},
  ];
}
