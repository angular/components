/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {ErrorStateMatcher, ThemePalette} from '@angular/material/core';
import {FloatLabelType} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';

/** Error any time control is invalid */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    if (control) {
      return control.invalid;
    }
    return false;
  }
}

type DisableDrinkOption = 'none' | 'first-middle-last' | 'all';

@Component({
  selector: 'select-demo',
  templateUrl: 'select-demo.html',
  styleUrl: 'select-demo.css',
  imports: [
    JsonPipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDemo {
  drinksRequired = false;
  drinkObjectRequired = false;
  pokemonRequired = false;
  drinksDisabled = false;
  drinksOptionsDisabled: DisableDrinkOption = 'none';
  pokemonDisabled = false;
  pokemonOptionsDisabled = false;
  showSelect = false;
  currentDrink: string;
  currentDrinkObject: {} | undefined = {value: 'tea-5', viewValue: 'Tea'};
  currentPokemon: string[];
  currentPokemonFromGroup: string;
  currentDigimon: string;
  currentAppearanceValue: string | null;
  latestChangeEvent: MatSelectChange | undefined;
  floatLabel: FloatLabelType = 'auto';
  drinksWidth = 'default';
  foodControl = new FormControl('pizza-1');
  topHeightCtrl = new FormControl(0);
  drinksTheme: ThemePalette = 'primary';
  pokemonTheme: ThemePalette = 'primary';
  compareByValue = true;
  selectFormControl = new FormControl('', Validators.required);

  sandwichBread = '';
  sandwichMeat = '';
  sandwichCheese = '';

  sandwichHideSingleSelectionIndicator = false;

  foods = [
    {value: null, viewValue: 'None'},
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];

  drinks = [
    {value: 'coke-0', viewValue: 'Coke'},
    {
      value: 'long-name-1',
      viewValue: 'Decaf Chocolate Brownie Vanilla Gingerbread Frappuccino',
      disabled: false,
    },
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
    {value: 'squirtle-2', viewValue: 'Squirtle'},
    {value: 'pikachu-3', viewValue: 'Pikachu'},
    {value: 'jigglypuff-4', viewValue: 'Jigglypuff with a really long name that will truncate'},
    {value: 'ditto-5', viewValue: 'Ditto'},
    {value: 'psyduck-6', viewValue: 'Psyduck'},
  ];

  availableThemes = [
    {value: 'primary', name: 'Primary'},
    {value: 'accent', name: 'Accent'},
    {value: 'warn', name: 'Warn'},
  ];

  pokemonGroups = [
    {
      name: 'Grass',
      pokemon: [
        {value: 'bulbasaur-0', viewValue: 'Bulbasaur'},
        {value: 'oddish-1', viewValue: 'Oddish'},
        {value: 'bellsprout-2', viewValue: 'Bellsprout'},
      ],
    },
    {
      name: 'Water',
      pokemon: [
        {value: 'squirtle-3', viewValue: 'Squirtle'},
        {value: 'psyduck-4', viewValue: 'Psyduck'},
        {value: 'horsea-5', viewValue: 'Horsea'},
      ],
    },
    {
      name: 'Fire',
      disabled: true,
      pokemon: [
        {value: 'charmander-6', viewValue: 'Charmander'},
        {value: 'vulpix-7', viewValue: 'Vulpix'},
        {value: 'flareon-8', viewValue: 'Flareon'},
      ],
    },
    {
      name: 'Psychic',
      pokemon: [
        {value: 'mew-9', viewValue: 'Mew'},
        {value: 'mewtwo-10', viewValue: 'Mewtwo'},
      ],
    },
  ];

  digimon = [
    {value: 'mihiramon-0', viewValue: 'Mihiramon'},
    {value: 'sandiramon-1', viewValue: 'Sandiramon'},
    {value: 'sinduramon-2', viewValue: 'Sinduramon'},
    {value: 'pajiramon-3', viewValue: 'Pajiramon'},
    {value: 'vajiramon-4', viewValue: 'Vajiramon'},
    {value: 'indramon-5', viewValue: 'Indramon'},
  ];

  breads = [
    {value: 'white', viewValue: 'White'},
    {value: 'white', viewValue: 'Wheat'},
    {value: 'white', viewValue: 'Sourdough'},
  ];

  meats = [
    {value: 'turkey', viewValue: 'Turkey'},
    {value: 'bacon', viewValue: 'Bacon'},
    {value: 'veggiePatty', viewValue: 'Veggie Patty'},
    {value: 'tuna', viewValue: 'Tuna'},
  ];

  cheeses = [
    {value: 'none', viewValue: 'None'},
    {value: 'swiss', viewValue: 'Swiss'},
    {value: 'american', viewValue: 'American'},
    {value: 'cheddar', viewValue: 'Cheddar'},
  ];

  toggleDisabled() {
    this.foodControl.enabled ? this.foodControl.disable() : this.foodControl.enable();
  }

  setPokemonValue() {
    this.currentPokemon = ['jigglypuff-4', 'psyduck-6'];
  }

  reassignDrinkByCopy() {
    this.currentDrinkObject = {...this.currentDrinkObject};
  }

  compareDrinkObjectsByValue(d1: {value: string}, d2: {value: string}) {
    return d1 && d2 && d1.value === d2.value;
  }

  compareByReference(o1: any, o2: any) {
    return o1 === o2;
  }

  matcher = new MyErrorStateMatcher();

  toggleSelected() {
    this.currentAppearanceValue = this.currentAppearanceValue ? null : this.digimon[0].value;
  }

  isDrinkOptionDisabled(index: number) {
    if (this.drinksOptionsDisabled === 'all') {
      return true;
    }
    if (this.drinksOptionsDisabled === 'first-middle-last') {
      return (
        index === 0 ||
        index === this.drinks.length - 1 ||
        index === Math.floor(this.drinks.length / 2)
      );
    }
    return false;
  }
}
