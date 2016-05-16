import {Component} from '@angular/core';
import {MdToggle, MdToggleGroup, MdToggleGroupMultiple} from '@angular2-material/toggle/toggle';
import {MdToggleDispatcher} from '@angular2-material/toggle/toggle_dispatcher';

@Component({
  moduleId: module.id,
  selector: 'toggle-demo',
  templateUrl: 'toggle-demo.html',
  providers: [MdToggleDispatcher],
  directives: [MdToggle, MdToggleGroup, MdToggleGroupMultiple]
})
export class ToggleDemo { }
