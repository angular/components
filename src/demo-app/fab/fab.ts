import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'fab',
  templateUrl: 'fab.html',
  styleUrls: ['font-awesome.min.css','fab.css'],
})

const POSITION_LEFT = 0;
const POSITION_RIGHT = 1;
const POSITION_DOWN = 2;
const POSITION_UP = 3;

export class FabComponent {
  type: string;
  position: string;
  amount: number;
}
