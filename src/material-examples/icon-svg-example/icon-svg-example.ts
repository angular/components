import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MdIconRegistry} from '@angular/material';

/**
 * @title SVG icons
 * @id icon-svg
 * @component IconSvgExample
 */
@Component({
  selector: 'icon-svg-example',
  templateUrl: 'icon-svg-example.html',
})
export class IconSvgExample {
  constructor(iconRegistry: MdIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
        'thumbs-up',
        sanitizer.bypassSecurityTrustResourceUrl('assets/img/examples/thumbup-icon.svg'));
  }
}
