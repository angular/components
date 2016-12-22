import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GuideItems, GuideItem} from '../../shared/guide-items/guide-items';


@Component({
  selector: 'guide-viewer',
  templateUrl: './guide-viewer.html',
  styleUrls: ['./guide-viewer.scss'],
})
export class GuideViewer {
  guide: GuideItem;

  constructor(private _route: ActivatedRoute, public guideItems: GuideItems) {
    _route.params.subscribe(p => {
      this.guide = guideItems.getItemById(p['id']);
    });
  }
}
