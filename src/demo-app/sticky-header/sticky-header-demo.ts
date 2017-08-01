import {Component} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {CdkStickyRegion, CdkStickyHeader} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'sticky-header-demo',
  templateUrl: 'sticky-header-demo.html',
  styleUrls: ['sticky-header-demo.css'],
})

export class StickyHeaderDemo {
  items: any[] = [
    {name: 'Min', messages: 'Brunch is this weekend?'},
    {name: 'Li', messages: 'Yes'},
    {name: 'Chan', messages: 'Looking'},
    {name: 'Chan', messages: 'Forward'},
    {name: 'Chan', messages: 'To It !'},
    {name: 'Min', messages: 'Branch is this weekend?'},
    {name: 'Eat', messages: 'Green Peppers'},
    {name: 'Chan', messages: 'Where?'},
    {name: 'Jack', messages: 'Pirate!'},
    {name: 'Jone', messages: 'Black pearl'},
    {name: 'Jack', messages: 'Back to the sea!'},
  ];
}
