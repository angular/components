import {Component} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';

/** @title Basic sidenav */
@Component({
  selector: 'sidenav-overview-example',
  templateUrl: 'sidenav-overview-example.html',
  styleUrl: 'sidenav-overview-example.css',
  standalone: true,
  imports: [MatSidenavModule],
})
export class SidenavOverviewExample {
  shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);
}
