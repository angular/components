import {Component, ViewEncapsulation} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'examples',
  templateUrl: 'examples.html',
  encapsulation: ViewEncapsulation.None,
})
export class Examples {
  navItems = [
    {name: 'Slider Overview', route: 'slider/overview'},
    {name: 'Configurable Slider', route: 'slider/configurable'},
    {name: 'Sidenav Overview', route: 'sidenav/overview'},
    {name: 'Sidenav with FAB', route: 'sidenav/fab'},
    {name: 'Input Overview', route: 'input/overview'},
    {name: 'Input Form', route: 'input/form'},
    {name: 'Button Overview', route: 'button/overview'},
    {name: 'Button Types', route: 'button/types'},
  ];
}
