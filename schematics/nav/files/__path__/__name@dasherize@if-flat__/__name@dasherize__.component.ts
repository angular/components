import { Component, <% if(!!viewEncapsulation) { %>, ViewEncapsulation<% }%><% if(changeDetection !== 'Default') { %>, ChangeDetectionStrategy<% }%> } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: '<%= selector %>',<% if(inlineTemplate) { %>
  template: `
      <mat-drawer-container>
      <mat-drawer mode="side" #drawer [opened]="!isHandset">
        <mat-toolbar color="primary">Menu</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item href="#">Link 1</a>
          <a mat-list-item href="#">Link 2</a>
          <a mat-list-item href="#">Link 3</a>
        </mat-nav-list>
      </mat-drawer>
      <mat-drawer-content>
        <mat-toolbar color="primary">
          <button type="button" mat-icon-button (click)="drawer.toggle()" *ngIf="isHandset">
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          <span>Application Title</span>
        </mat-toolbar>
      </mat-drawer-content>
    </mat-drawer-container>
  `,<% } else { %>
  templateUrl: './<%= dasherize(name) %>.component.html',<% } if(inlineStyle) { %>
  styles: [
    `
      mat-drawer-container {
        height: 100%;
      }
      
      mat-drawer {
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
  isHandset: boolean;
  constructor(breakpointObserver: BreakpointObserver) {
    this.isHandset = breakpointObserver.isMatched(Breakpoints.Handset);
  }
}
