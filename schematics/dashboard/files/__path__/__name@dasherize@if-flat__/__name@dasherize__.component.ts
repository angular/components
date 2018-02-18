import { Component, <% if(!!viewEncapsulation) { %>, ViewEncapsulation<% }%><% if(changeDetection !== 'Default') { %>, ChangeDetectionStrategy<% }%> } from '@angular/core';

declare var google: any;

@Component({
  selector: '<%= selector %>',<% if(inlineTemplate) { %>
  template: `
    <div class="grid-container">
      <h1 class="mat-h1">Dashboard</h1>
      <mat-grid-list cols="2" rowHeight="350px">
        <mat-grid-tile *ngFor="let card of cards">
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                {{card.title}}
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon aria-label="Menu icon">more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu" xPosition="before">
                  <button mat-menu-item>Expand</button>
                  <button mat-menu-item>Remove</button>
                </mat-menu>
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div style="text-align:center">Card Content Here</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>
    </div>
  `,<% } else { %>
  templateUrl: './<%= dasherize(name) %>.component.html',<% } if(inlineStyle) { %>
  styles: [
    `
      .grid-container {
        margin: 20px;
      }
      
      mat-card {
        position: absolute;
        top: 15px;
        left: 15px;
        right: 15px;
        bottom: 15px;
      }
      
      [mat-icon-button] {
        position: absolute;
        top: 5px;
        right: 10px;
      }
  `
  ]<% } else { %>
  styleUrls: ['./<%= dasherize(name) %>.component.<%= styleext %>']<% } %><% if(!!viewEncapsulation) { %>,
  encapsulation: ViewEncapsulation.<%= viewEncapsulation %><% } if (changeDetection !== 'Default') { %>,
  changeDetection: ChangeDetectionStrategy.<%= changeDetection %><% } %>
})
export class <%= classify(name) %>Component {
  cards = [
    {
      title: 'Card 1'
    },
    {
      title: 'Card 2'
    },
    {
      title: 'Card 3'
    },
    {
      title: 'Card 4'
    }
  ];
}
