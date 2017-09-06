import {Component, ViewEncapsulation} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'basic-sidenav-a11y',
  templateUrl: 'basic-sidenav-a11y.html',
  styleUrls: ['shared.css'],
  host: {'class': 'demo-sidenav-a11y'},
  encapsulation: ViewEncapsulation.None,
})
export class SidenavBasicAccessibilityDemo {}
