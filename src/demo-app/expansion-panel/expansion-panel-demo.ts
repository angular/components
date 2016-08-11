import {Component} from '@angular/core';
import {MD_BUTTON_DIRECTIVES} from '@angular2-material/button/button';
import {MD_INPUT_DIRECTIVES} from '@angular2-material/input/input';
import {MD_EXPANSION_PANEL_DIRECTIVES} from '@angular2-material/expansion-panel/expansion-panel';

@Component({
  moduleId: module.id,
  selector: 'expansion-panel-demo',
  templateUrl: 'expansion-panel-demo.html',
  directives: [MD_EXPANSION_PANEL_DIRECTIVES, MD_INPUT_DIRECTIVES, MD_BUTTON_DIRECTIVES]
})
export class ExpansionPanelDemo {}
