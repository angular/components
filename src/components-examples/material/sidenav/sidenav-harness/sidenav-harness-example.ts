import {Component} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';

/**
 * @title Testing with MatSidenavHarness
 */
@Component({
  selector: 'sidenav-harness-example',
  templateUrl: 'sidenav-harness-example.html',
  standalone: true,
  imports: [MatSidenavModule],
})
export class SidenavHarnessExample {}
