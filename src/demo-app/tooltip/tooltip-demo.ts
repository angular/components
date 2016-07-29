import {Component} from '@angular/core';
import {MD_TOOLTIP_DIRECTIVES, TooltipPosition} from '@angular2-material/tooltip/tooltip';
import {OVERLAY_PROVIDERS} from '@angular2-material/core/overlay/overlay';
import {MD_RADIO_DIRECTIVES} from '@angular2-material/radio/radio';
import {MdUniqueSelectionDispatcher} from
    '@angular2-material/core/coordination/unique-selection-dispatcher';
import {MD_BUTTON_DIRECTIVES} from '@angular2-material/button/button';

@Component({
  //MODULE //MODULE //MODULE //MODULE //MODULE //MODULE //MODULE //MODULE //MODULE //MODULE //MODULE moduleId: module.id,
  selector: 'tooltip-demo',
  templateUrl: 'tooltip-demo.html',
  styleUrls: ['tooltip-demo.css'],
})
export class TooltipDemo {
  position: TooltipPosition = 'below';
}
