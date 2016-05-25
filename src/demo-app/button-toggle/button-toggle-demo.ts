import {Component} from '@angular/core';
import {MD_BUTTON_TOGGLE_DIRECTIVES} from '@angular2-material/button-toggle/button-toggle';
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';

@Component({
  moduleId: module.id,
  selector: 'button-toggle-demo',
  templateUrl: 'button-toggle-demo.html',
  providers: [MdUniqueSelectionDispatcher],
  directives: [MD_BUTTON_TOGGLE_DIRECTIVES]
})
export class ButtonToggleDemo { }
