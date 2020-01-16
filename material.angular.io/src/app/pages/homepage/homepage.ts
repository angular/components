import {Component, NgModule, OnInit} from '@angular/core';
import {SvgViewerModule} from '../../shared/svg-viewer/svg-viewer';
import {MatButtonModule} from '@angular/material/button';
import {FooterModule} from '../../shared/footer/footer';
import {RouterModule, Routes} from '@angular/router';
import {ComponentPageTitle} from '../page-title/page-title';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss']
})
export class Homepage implements OnInit {
  isNextVersion = location.hostname.startsWith('next.material.angular.io');

  constructor(public _componentPageTitle: ComponentPageTitle) {}

  ngOnInit(): void {
    this._componentPageTitle.title = '';
  }
}

const routes: Routes = [ {path : '', component : Homepage} ];

@NgModule({
  imports: [SvgViewerModule, MatButtonModule, FooterModule, RouterModule.forChild(routes)],
  exports: [Homepage],
  declarations: [Homepage],
})
export class HomepageModule {}
