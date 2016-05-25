import {Component} from '@angular/core';
import {MD_TOGGLE_DIRECTIVES} from '@angular2-material/toggle/toggle';
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';

@Component({
  moduleId: module.id,
  selector: 'toggle-demo',
  templateUrl: 'toggle-demo.html',
  providers: [MdUniqueSelectionDispatcher],
  directives: [MD_TOGGLE_DIRECTIVES]
})
export class ToggleDemo { }
