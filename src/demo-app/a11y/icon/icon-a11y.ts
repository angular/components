import {Component, ViewEncapsulation} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MdIconRegistry} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'icon-a11y',
  templateUrl: 'icon-a11y.html',
  encapsulation: ViewEncapsulation.None,
})
export class IconAccessibilityDemo {
  constructor(mdIconRegistry: MdIconRegistry, sanitizer: DomSanitizer) {
    mdIconRegistry
      .addSvgIcon('thumb-up',
        sanitizer.bypassSecurityTrustResourceUrl('/icon/assets/thumbup-icon.svg'))
      .addSvgIconSetInNamespace('core',
        sanitizer.bypassSecurityTrustResourceUrl('/icon/assets/core-icon-set.svg'));
  }
}
