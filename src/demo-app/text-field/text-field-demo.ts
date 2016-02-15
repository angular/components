import {Component} from 'angular2/core';
import {MdTextField} from '../../components/text-field/text-field';

@Component({
    selector: 'text-field-demo',
    templateUrl: 'demo-app/text-field/text-field-demo.html',
    styleUrls: ['demo-app/text-field/text-field-demo.css'],
    directives: [MdTextField]
})
export class TextFieldDemo {

}
