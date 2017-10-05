import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'badge-demo',
  templateUrl: 'badge-demo.html',
  styleUrls: ['badge-demo.css'],
})
export class BadgeDemo {

  badgeContent = '1';
  svgIcon = 'cat';

  constructor(_iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    _iconRegistry.addSvgIcon('home',
      sanitizer.bypassSecurityTrustResourceUrl(
        'https://upload.wikimedia.org/wikipedia/commons/3/34/Home-icon.svg'));

    _iconRegistry.addSvgIcon('cat',
      sanitizer.bypassSecurityTrustResourceUrl(
        'https://upload.wikimedia.org/wikipedia/commons/3/34/Home-icon.svg'));
  }
}
