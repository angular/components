import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'menu-demo',
  templateUrl: 'menu-demo.html',
  styleUrls: ['menu-demo.css'],
})
export class MenuDemo {
  selected = '';
  items = [
    {text: 'Refresh'},
    {text: 'Settings'},
    {text: 'Help', disabled: true},
    {text: 'Sign Out'}
  ];

  iconItems = [
    {text: 'Redial', icon: 'dialpad'},
    {text: 'Check voicemail', icon: 'voicemail', disabled: true},
    {text: 'Disable alerts', icon: 'notifications_off'}
  ];
  // User data pulled from menu form
  user = {
    email: '',
    subscribe: false,
    favoriteSeason: 'Autumn',
    favoriteDrink: 'Lemonade',
    isVegetarian: false,
    age: 0,
  };
  // Select box option in menu form
  drinks = [
    {value: 'coke-0', viewValue: 'Coke'},
    {value: 'long-name-1', viewValue: 'Decaf Chocolate Brownie Vanilla Gingerbread Frappuccino'},
    {value: 'water-2', viewValue: 'Water'},
    {value: 'pepper-3', viewValue: 'Dr. Pepper'},
  ];

  // Radio option in menu form
  seasonOptions = [
    'Winter',
    'Spring',
    'Summer',
    'Autumn',
  ];
  select(text: string) { this.selected = text; }
}
