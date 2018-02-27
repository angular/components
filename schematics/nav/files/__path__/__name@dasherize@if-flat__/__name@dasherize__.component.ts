import { Component, <% if(!!viewEncapsulation) { %>, ViewEncapsulation<% }%><% if(changeDetection !== 'Default') { %>, ChangeDetectionStrategy<% }%> } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: '<%= selector %>',<% if(inlineTemplate) { %>
  template: `
    <mat-sidenav-container>
      <mat-sidenav fixedInViewport="true" [mode]="isHandset ? 'over' : 'side'" #drawer [opened]="!(_isHandset | async)!.matches">
        <mat-toolbar color="primary">Menu</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item href="#">Link 1</a>
          <a mat-list-item href="#">Link 2</a>
          <a mat-list-item href="#">Link 3</a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button type="button" mat-icon-button (click)="drawer.toggle()" *ngIf="(_isHandset | async)!.matches">
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          <span>Application Title</span>
        </mat-toolbar>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,<% } else { %>
  templateUrl: './<%= dasherize(name) %>.component.html',<% } if(inlineStyle) { %>
  styles: [
    `
    mat-sidenav-container {
      height: 100%;
    }
    
    mat-sidenav {
      width: 200px;
      box-shadow: 3px 0 6px rgba(0,0,0,.24);
    }
  `
  ]<% } else { %>
  styleUrls: ['./<%= dasherize(name) %>.component.<%= styleext %>']<% } %><% if(!!viewEncapsulation) { %>,
  encapsulation: ViewEncapsulation.<%= viewEncapsulation %><% } if (changeDetection !== 'Default') { %>,
  changeDetection: ChangeDetectionStrategy.<%= changeDetection %><% } %>
})
export class <%= classify(name) %>Component {
  _isHandset: Observable<BreakpointState> = this._breakpointObserver.observe(Breakpoints.Handset);
  constructor(private _breakpointObserver: BreakpointObserver) {}
}
