import {Component, ViewEncapsulation} from '@angular/core';
import {MediaQueryManager, MediaChange, MEDIA_QUERIES} from '@angular/material';
import {Observable} from 'rxjs/Observable';

@Component({
  moduleId: module.id,
  selector: 'screen-type',
  templateUrl: 'screen-type-demo.html',
  styleUrls: ['screen-type-demo.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ScreenTypeDemo {
  isHandset: Observable<MediaChange>;
  isTablet: Observable<MediaChange>;
  isWeb: Observable<MediaChange>;
  isPortrait: Observable<MediaChange>;
  isLandscape: Observable<MediaChange>;
  showthis = true;

  constructor(private mqm: MediaQueryManager) {
    this.isHandset = this.mqm.observe([MEDIA_QUERIES.HandsetLandscape,
                                       MEDIA_QUERIES.HandsetPortrait]);
    this.isTablet = this.mqm.observe([MEDIA_QUERIES.TabletLandscape, MEDIA_QUERIES.TabletPortrait]);
    this.isWeb = this.mqm.observe([MEDIA_QUERIES.WebLandscape, MEDIA_QUERIES.WebPortrait]);
    this.isPortrait = this.mqm.observe('(orientation: portrait)');
    this.isLandscape = this.mqm.observe('(orientation: landscape)');
  }
}
