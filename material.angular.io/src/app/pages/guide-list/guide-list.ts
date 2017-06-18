import {Component, NgModule} from '@angular/core';
import {GuideItems} from '../../shared/guide-items/guide-items';
import {MdListModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {FooterModule} from '../../shared/footer/footer';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-guides',
  templateUrl: './guide-list.html',
  styleUrls: ['./guide-list.scss']
})
export class GuideList {
  constructor(public guideItems: GuideItems) {}
}


@NgModule({
  imports: [MdListModule, RouterModule, FooterModule, CommonModule],
  exports: [GuideList],
  declarations: [GuideList],
  providers: [GuideItems],
})
export class GuideListModule { }
