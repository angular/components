import {Component} from 'angular2/core';
import {MdInteraction, MdInteractionType} from '../../core/interaction/interaction';
import {MdButton} from '../../components/button/button';

@Component({
  selector: 'interaction-demo',
  templateUrl: 'demo-app/interaction/interaction-demo.html',
  styleUrls: ['demo-app/interaction/interaction-demo.css'],
  directives: [MdButton]
})
export class InteractionDemo {

  constructor(private interaction: MdInteraction) {};

  alertLastInteraction() {
    let lastInteraction = this.interaction.getLastInteractionType();

    switch (lastInteraction) {
      case MdInteractionType.KEYBOARD:
        alert('Keyboards are sometimes very loud - Try switching to a mouse.');
        break;
      case MdInteractionType.MOUSE:
        alert('Using a mouse is cool! What sensitivity are you using?');
        break;
      case MdInteractionType.TOUCH:
        alert('Material also runs well on touch devices.');
        break;
    }
  }

}
