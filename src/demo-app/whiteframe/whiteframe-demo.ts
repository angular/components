import {Component} from 'angular2/core';
import {MdWhiteframe} from '../../components/whiteframe/whiteframe';
import {COMMON_DIRECTIVES} from 'angular2/common';

@Component({
    selector: 'card-demo',
    templateUrl: 'demo-app/whiteframe/whiteframe-demo.html',
    styleUrls: ['demo-app/whiteframe/whiteframe-demo.css'],
    directives: [MdWhiteframe, COMMON_DIRECTIVES]
})
export class WhiteframeDemo {
    elevations:Array<number> = [];

    constructor() {
        for (var i = 1; i <= 24; ++i) {
            this.elevations.push(i);
        }
    }
}