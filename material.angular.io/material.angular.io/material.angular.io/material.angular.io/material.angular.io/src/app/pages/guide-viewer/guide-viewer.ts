import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GuideItems} from '../../shared/guide-items/guide-items';


@Component({
  selector: 'guide-viewer',
  templateUrl: './guide-viewer.html',
  styleUrls: ['./guide-viewer.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GuideViewer {
  documentUrl: string;

  constructor(private _route: ActivatedRoute, public guideItems: GuideItems) {
    _route.params.subscribe(p => {
      this.documentUrl = guideItems.getItemById(p['id']).document;
    });
  }
}
