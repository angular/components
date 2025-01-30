import {Component, HostBinding, OnInit} from '@angular/core';
import {GuideItems} from '../../shared/guide-items/guide-items';
import {RouterLink} from '@angular/router';
import {Footer} from '../../shared/footer/footer';
import {NavigationFocus} from '../../shared/navigation-focus/navigation-focus';
import {ComponentPageTitle} from '../page-title/page-title';
import {MatCardModule} from '@angular/material/card';
import {MatRipple} from '@angular/material/core';

@Component({
  selector: 'app-guides',
  templateUrl: './guide-list.html',
  styleUrls: ['./guide-list.scss'],
  standalone: true,
  imports: [NavigationFocus, RouterLink, MatCardModule, Footer, MatRipple],
})
export class GuideList implements OnInit {
  @HostBinding('class.main-content') readonly mainContentClass = true;

  constructor(
    public guideItems: GuideItems,
    public _componentPageTitle: ComponentPageTitle,
  ) {}

  ngOnInit(): void {
    this._componentPageTitle.title = 'Guides';
  }
}
