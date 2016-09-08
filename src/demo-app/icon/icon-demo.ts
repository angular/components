import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconRegistry} from '@angular2-material/icon';

@Component({
  moduleId: module.id,
  selector: 'mat-icon-demo',
  templateUrl: 'icon-demo.html',
  styleUrls: ['icon-demo.css'],
  viewProviders: [MatIconRegistry],
  encapsulation: ViewEncapsulation.None,
})
export class IconDemo {
  constructor(matIconRegistry: MatIconRegistry) {
    matIconRegistry
        .addSvgIcon('thumb-up', '/icon/assets/thumbup-icon.svg')
        .addSvgIconSetInNamespace('core', '/icon/assets/core-icon-set.svg')
        .registerFontClassAlias('fontawesome', 'fa');
  }
}
