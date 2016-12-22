import {Component} from '@angular/core';
import {GuideItems} from '../../shared/guide-items/guide-items';

@Component({
  selector: 'app-guides',
  templateUrl: './guide-list.html',
  styleUrls: ['./guide-list.scss']
})
export class GuideList {
  constructor(public guideItems: GuideItems) {}
}
