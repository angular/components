import {Component} from '@angular/core';
import {MdCard} from '@angular2-material/card/card';
import {MdToolbar} from '@angular2-material/toolbar/toolbar';
import {MD_DIVIDER_DIRECTIVES} from '@angular2-material/divider/divider';
import {MD_LIST_DIRECTIVES} from '@angular2-material/list/list';

@Component({  
  moduleId: module.id,
  selector: 'divider-demo',
  templateUrl: 'divider-demo.html',
  styleUrls: ['divider-demo.css'],
  directives: [MdCard, MdToolbar, MD_DIVIDER_DIRECTIVES, MD_LIST_DIRECTIVES],
})
export class DividerDemo {
  messages: Array<any> = [
    {
      from: 'Nancy',
      subject: 'Brunch?',
      message: 'Did you want to go on Sunday? I was thinking that might work.',
      image: 'https://angular.io/resources/images/bios/julie-ralph.jpg'
    },
    {
      from: 'Mary',
      subject: 'Summer BBQ',
      message: 'Wish I could come, but I have some prior obligations.',
      image: 'https://angular.io/resources/images/bios/juleskremer.jpg'
    },
    {
      from: 'Bobby',
      subject: 'Oui oui',
      message: 'Do you have Paris reservations for the 15th? I just booked!',
      image: 'https://angular.io/resources/images/bios/jelbourn.jpg'
    }
  ];
}
