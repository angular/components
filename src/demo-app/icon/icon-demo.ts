import {Component} from 'angular2/core';
import {MdIcon} from '../../components/icon/icon';
import {MdIconProvider} from '../../components/icon/icon-provider';

@Component({
    selector: 'button-demo',
    templateUrl: 'demo-app/icon/icon-demo.html',
    styleUrls: ['demo-app/icon/icon-demo.css'],
    directives: [MdIcon],
    viewProviders: [MdIconProvider],
})
export class IconDemo {
  constructor(mdIconProvider: MdIconProvider) {
      mdIconProvider.icon('thumb-up', '/demo-app/assets/thumbup-icon.svg');
  }
}
