import {Component, ViewEncapsulation} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'mobile-sidenav-a11y',
  templateUrl: 'mobile-sidenav-a11y.html',
  styleUrls: ['shared.css'],
  host: {'class': 'demo-sidenav-a11y'},
  encapsulation: ViewEncapsulation.None,
})
export class SidenavMobileAccessibilityDemo {}
