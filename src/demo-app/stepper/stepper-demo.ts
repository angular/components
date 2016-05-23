import {
  Component,
  ViewEncapsulation
} from '@angular/core';
import { MD_STEPPER_DIRECTIVES } from '@angular2-material/stepper/stepper';
import { MdSlideToggle } from '@angular2-material/slide-toggle/slide-toggle';

@Component({
  moduleId: module.id,
  selector: 'stepper-demo',
  templateUrl: 'stepper-demo.html',
  styleUrls: ['stepper-demo.css'],
  directives: [MD_STEPPER_DIRECTIVES, MdSlideToggle],
  encapsulation: ViewEncapsulation.None
})
export class StepperDemo {

  steps = [
    { label: 'Step Two', optional: 'false', editable: 'false',
      content: 'This is the content of the second step.' +
        'ATTENTION: This step is not editable after it is completed!'
    },
    { label: 'Step Three', optional: 'true', editable: 'true',
      content: 'This is the content of the third step.'
    },
    { label: 'Step Four', optional: 'false', editable: 'true',
      content: 'This is the content of the fourth step'
    }
  ];
}
