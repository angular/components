import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MdSelectChange} from '@angular/material';

@Component({
    moduleId: module.id,
    selector: 'select-demo',
    templateUrl: 'select-demo.html',
    styleUrls: ['select-demo.css'],
})
export class SelectDemo {
  isRequired = false;
  movieRequired = false;
  isDisabled = false;
  moviesDisabled = false;
  showSelect = false;
  currentDrink: string;
  currentMovie: string;
  latestChangeEvent: MdSelectChange;
  foodControl = new FormControl('pizza-1');

  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];

  drinks = [
    {value: 'coke-0', viewValue: 'Coke'},
    {value: 'long-name-1', viewValue: 'Decaf Chocolate Brownie Vanilla Gingerbread Frappuccino'},
    {value: 'water-2', viewValue: 'Water'},
    {value: 'pepper-3', viewValue: 'Dr. Pepper'},
    {value: 'coffee-4', viewValue: 'Coffee'},
    {value: 'tea-5', viewValue: 'Tea'},
    {value: 'juice-6', viewValue: 'Orange juice'},
    {value: 'wine-7', viewValue: 'Wine'},
    {value: 'milk-8', viewValue: 'Milk'},
  ];

  pokemon = [
    {value: 'bulbasaur-0', viewValue: 'Bulbasaur'},
    {value: 'charizard-1', viewValue: 'Charizard'},
    {value: 'squirtle-2', viewValue: 'Squirtle'}
  ];

  movies = [
    {value: 'moonraker-0', viewValue: 'Moonraker'},
    {value: 'goldfinger-1', viewValue: 'Sprite'},
    {value: 'thunderball-2', viewValue: 'Water'},
    {value: 'dr-no-3', viewValue: 'Dr. No'},
    {value: 'octopussy-4', viewValue: 'Octopussy'},
    {value: 'goldeneye-5', viewValue: 'Goldeneye'},
    {value: 'skyfall-6', viewValue: 'Skyfall'},
    {value: 'spectre-7', viewValue: 'Spectre'}
  ];

  toggleDisabled() {
    this.foodControl.enabled ? this.foodControl.disable() : this.foodControl.enable();
  }
}
