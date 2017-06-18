import {Component, NgModule} from '@angular/core';
import {MdCardModule} from '@angular/material';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {ComponentPageTitle} from '../page-title/page-title';
import {SvgViewerModule} from '../../shared/svg-viewer/svg-viewer';


@Component({
  selector: 'app-component-category-list',
  templateUrl: './component-category-list.html',
  styleUrls: ['./component-category-list.scss']
})
export class ComponentCategoryList {
  constructor(public docItems: DocumentationItems,
              public _componentPageTitle: ComponentPageTitle) {}

  ngOnInit() {
    this._componentPageTitle.title = 'Component Library';
  }
}

@NgModule({
  imports: [SvgViewerModule, MdCardModule, CommonModule, RouterModule],
  exports: [ComponentCategoryList],
  declarations: [ComponentCategoryList],
  providers: [DocumentationItems, ComponentPageTitle],
})
export class ComponentCategoryListModule { }
