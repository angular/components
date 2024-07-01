import {BreakpointObserver, BreakpointState, Breakpoints} from '@angular/cdk/layout';
import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {Observable, Subscription} from 'rxjs';
import {AsyncPipe} from '@angular/common';

/** @title Responsive sidenav */
@Component({
  selector: 'sidenav-responsive-example',
  templateUrl: 'sidenav-responsive-example.html',
  styleUrl: 'sidenav-responsive-example.css',
  standalone: true,
  imports: [
    AsyncPipe,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
  ],
})
export class SidenavResponsiveExample implements OnDestroy {
  isHandset: Observable<BreakpointState>;
  fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);
  fillerContent = Array.from(
    {length: 50},
    () =>
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  );

  mobileQuery: boolean;
  private _breakpointSubscription: Subscription;

  constructor(
    private _breakpointObserver: BreakpointObserver,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    this.isHandset = _breakpointObserver.observe([
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait,
    ]);
    this._breakpointSubscription = this._breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe(result => {
        this.mobileQuery = result.matches;
        this._changeDetectorRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this._breakpointSubscription.unsubscribe();
  }

  shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);
}
