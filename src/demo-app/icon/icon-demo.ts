import {Component, ViewEncapsulation} from 'angular2/core';
import {MdIcon} from '../../components/icon/icon';
import {MdIconProvider} from '../../components/icon/icon-provider';

@Component({
    selector: 'icon-demo',
    templateUrl: 'demo-app/icon/icon-demo.html',
    styleUrls: ['demo-app/icon/icon-demo.css'],
    directives: [MdIcon],
    viewProviders: [MdIconProvider],
    encapsulation: ViewEncapsulation.None,
})
export class IconDemo {
  showAndroid = true;

  constructor(mdIconProvider: MdIconProvider) {
      mdIconProvider
          .registerIcon('thumb-up', '/demo-app/icon/assets/thumbup-icon.svg')
          .registerIconSet('core', '/demo-app/icon/assets/core-icon-set.svg')
          .registerFontSet('fontawesome', 'fa');
  }
}
