import {Component, ViewEncapsulation} from '@angular/core';

@Component({selector: 'home', template: `<p>e2e website!</p>`})
export class Home {}

@Component({
  selector: 'e2e-app-layout',
  templateUrl: 'e2e-app-layout.html',
  encapsulation: ViewEncapsulation.None,
})
export class E2eAppLayout {
  showLinks = false;

  navLinks = [
    {path: 'block-scroll-strategy', title: 'Block Scroll Strategy'},
    {path: 'component-harness', title: 'Component Harness'},
    {path: 'slider', title: 'Slider'},
    {path: 'virtual-scroll', title: 'Virtual Scroll'},
  ];
}
