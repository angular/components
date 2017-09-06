import {Component, ViewEncapsulation} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'dual-sidenav-a11y',
  templateUrl: 'dual-sidenav-a11y.html',
  styleUrls: ['shared.css'],
  host: {'class': 'a11y-demo-sidenav-app'},
  encapsulation: ViewEncapsulation.None,
})
export class SidenavDualAccessibilityDemo {}
