import { Component} from '@angular/core';

@Component({
  selector: 'app-components',
  templateUrl: 'components.html',
  styleUrls: ['components.scss']
})
export class ComponentsList {
  componentItems = [
    {name: 'Buttons', src: 'button'},
    {name: 'Cards', src: 'card'},
    {name: 'Chips', src: 'chip'},
    {name: 'Grid lists', src: 'grid'},
    {name: 'Menu', src: 'menu'},
    {name: 'Tooltip', src: 'tooltip'},
    {name: 'Progress', src: 'progress'},
  ];
}
