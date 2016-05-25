import {Component} from '@angular/core';
import {MD_TOGGLE_DIRECTIVES} from '@angular2-material/toggle/toggle';
import {MdToggleDispatcher} from '@angular2-material/toggle/toggle_dispatcher';

@Component({
  moduleId: module.id,
  selector: 'toggle-demo',
  templateUrl: 'toggle-demo.html',
  providers: [MdToggleDispatcher],
  directives: [MD_TOGGLE_DIRECTIVES]
})
export class ToggleDemo { }
