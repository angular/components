import {Component} from '@angular/core';

/**
 * @title Select with custom panel height
 */
@Component({
  selector: 'select-panel-height-example',
  templateUrl: 'select-panel-height-example.html',
  styleUrls: ['select-panel-height-example.css'],
})
export class SelectPanelHeightExample {
  pokemonPanelHeight = 200;
  pokemon = [
    {value: 'bulbasaur-0', viewValue: 'Bulbasaur'},
    {value: 'charizard-1', viewValue: 'Charizard'},
    {value: 'squirtle-2', viewValue: 'Squirtle'},
    {value: 'pikachu-3', viewValue: 'Pikachu'},
    {value: 'jigglypuff-4', viewValue: 'Jigglypuff with a really long name that will truncate'},
    {value: 'ditto-5', viewValue: 'Ditto'},
    {value: 'psyduck-6', viewValue: 'Psyduck'},
    {value: 'caterpie-7', viewValue: 'Caterpie'},
    {value: 'weedle-8', viewValue: 'Weedle'},
    {value: 'pidgey-9', viewValue: 'Pidgey'},
    {value: 'rattata-10', viewValue: 'Rattata'},
    {value: 'spearow-11', viewValue: 'Spearow'},
    {value: 'ekans-12', viewValue: 'Ekans'},
    {value: 'sandshrew-13', viewValue: 'Sandshrew'},
    {value: 'nidoran-14', viewValue: 'Nidoran'},
    {value: 'clefairy-15', viewValue: 'Clefairy'},
    {value: 'vulpix-16', viewValue: 'Vulpix'},
    {value: 'zubat-17', viewValue: 'Zubat'},
    {value: 'oddish-18', viewValue: 'Oddish'},
    {value: 'paras-19', viewValue: 'Paras'},
  ];
}
