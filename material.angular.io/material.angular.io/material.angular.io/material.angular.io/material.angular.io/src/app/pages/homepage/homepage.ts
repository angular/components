import {Component, NgModule} from '@angular/core';
import {SvgViewerModule} from '../../shared/svg-viewer/svg-viewer';
import {MdButtonModule} from '@angular/material';
import {FooterModule} from '../../shared/footer/footer';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss']
})
export class Homepage {}

@NgModule({
  imports: [SvgViewerModule, MdButtonModule, FooterModule, RouterModule],
  exports: [Homepage],
  declarations: [Homepage],
})
export class HomepageModule { }
