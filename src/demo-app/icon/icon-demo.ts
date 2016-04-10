import {Component, ViewEncapsulation} from 'angular2/core';
import {MdIcon} from '../../components/icon/icon';
import {MdIconRegistry} from '../../components/icon/icon-registry';

@Component({
    selector: 'icon-demo',
    templateUrl: 'demo-app/icon/icon-demo.html',
    styleUrls: ['demo-app/icon/icon-demo.css'],
    directives: [MdIcon],
    viewProviders: [MdIconRegistry],
    encapsulation: ViewEncapsulation.None,
})
export class IconDemo {
  showAndroid = true;

  constructor(mdIconRegistry: MdIconRegistry) {
      mdIconRegistry
          .addIcon('thumb-up', '/demo-app/icon/assets/thumbup-icon.svg')
          .addIconSet('core', '/demo-app/icon/assets/core-icon-set.svg')
          .registerFontSet('fontawesome', 'fa');
  }
}
