import {Component} from '@angular/core';

@Component({
  selector: 'app-components',
  templateUrl: './components.html',
  styleUrls: ['./components.scss']
})
export class ComponentsList {
  componentItems = [
    {name: 'Button', src: 'button'},
    {name: 'Checkbox', src: 'checkbox'},
    {name: 'Radio button', src: 'radio'},
    {name: 'Button toggle', src: 'button-toggle'},
    {name: 'Input', src: 'input'},
    {name: 'Textarea', src: 'textarea'},
    {name: 'Select', src: 'select'},
    {name: 'Slide toggle', src: 'slide-toggle'},
    {name: 'Slider', src: 'slider'},

    {name: 'Card', src: 'card'},
    {name: 'List', src: 'list'},
    {name: 'Grid list', src: 'grid-list'},
    {name: 'Sidenav', src: 'sidenav'},
    {name: 'Toolbar', src: 'toolbar'},

    {name: 'Menu', src: 'menu'},
    {name: 'Dialog', src: 'dialog'},
    {name: 'Snackbar', src: 'snackbar'},
    {name: 'Tooltip', src: 'tooltip'},

    {name: 'Progress Spinner', src: 'progress-spinner'},
    {name: 'Progress Bar', src: 'progress-bar'},

    {name: 'Icon', src: 'icon'},
  ];
}
