import {Component} from '@angular/core';

@Component({
  selector: 'app-components',
  templateUrl: './component-list.html',
  styleUrls: ['./component-list.scss']
})
export class ComponentList {
  componentItems = [
    {id: 'button', name: 'Button', src: 'button'},
    {id: 'checkbox', name: 'Checkbox', src: 'checkbox'},
    {id: 'radio-button', name: 'Radio button', src: 'radio'},
    {id: 'button-toggle', name: 'Button toggle', src: 'button-toggle'},
    {id: 'input', name: 'Input', src: 'input'},
    {id: 'textarea', name: 'Textarea', src: 'textarea'},
    {id: 'select', name: 'Select', src: 'select'},
    {id: 'slide-toggle', name: 'Slide toggle', src: 'slide-toggle'},
    {id: 'slider', name: 'Slider', src: 'slider'},

    {id: 'card', name: 'Card', src: 'card'},
    {id: 'list', name: 'List', src: 'list'},
    {id: 'grid-list', name: 'Grid list', src: 'grid-list'},
    {id: 'sidenav', name: 'Sidenav', src: 'sidenav'},
    {id: 'toolbar', name: 'Toolbar', src: 'toolbar'},

    {id: 'menu', name: 'Menu', src: 'menu'},
    {id: 'dialog', name: 'Dialog', src: 'dialog'},
    {id: 'snackbar', name: 'Snackbar', src: 'snackbar'},
    {id: 'tooltip', name: 'Tooltip', src: 'tooltip'},

    {id: 'progress-spinner', name: 'Progress spinner', src: 'progress-spinner'},
    {id: 'progress-bar', name: 'Progress bar', src: 'progress-bar'},

    {id: 'icon', name: 'Icon', src: 'icon'},
  ];
}
