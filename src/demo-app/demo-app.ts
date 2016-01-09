import {Component} from 'angular2/core';
import {MdButton} from '../components/button/button';
import {MdSwitch} from '../components/switch/switch';
import {FORM_DIRECTIVES} from "angular2/common";


@Component({
  selector: 'demo-app',
  providers: [],
  templateUrl: 'demo-app/demo-app.html',
  directives: [MdButton, MdSwitch, FORM_DIRECTIVES],
  pipes: []
})
export class DemoApp { }
