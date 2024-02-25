import {Component} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';

/** @title Implicit main content with two sidenavs */
@Component({
  selector: 'sidenav-position-example',
  templateUrl: 'sidenav-position-example.html',
  styleUrl: 'sidenav-position-example.css',
  standalone: true,
  imports: [MatSidenavModule],
})
export class SidenavPositionExample {
  shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);
}
