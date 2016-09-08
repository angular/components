import {Component} from '@angular/core';
import {MatUniqueSelectionDispatcher} from '@angular2-material/core';

@Component({
  moduleId: module.id,
  selector: 'button-toggle-demo',
  templateUrl: 'button-toggle-demo.html',
  providers: [MatUniqueSelectionDispatcher],
})
export class ButtonToggleDemo {
  favoritePie = 'Apple';
  pieOptions = [
    'Apple',
    'Cherry',
    'Pecan',
    'Lemon',
  ];
}
