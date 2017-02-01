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
  ];
}
