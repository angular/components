import {Component, NgModule} from '@angular/core';
import {
  DocumentationItems,
  DocCategory
} from '../../shared/documentation-items/documentation-items';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {ComponentPageTitle} from '../page-title/page-title';
import {SvgViewerModule} from '../../shared/svg-viewer/svg-viewer';
import {CommonModule} from '@angular/common';
import {MdCardModule} from '@angular/material';

@Component({
  selector: 'app-components',
  templateUrl: './component-list.html',
  styleUrls: ['./component-list.scss']
})
export class ComponentList {
  category: DocCategory;

  constructor(public docItems: DocumentationItems,
              private _componentPageTitle: ComponentPageTitle,
              private _route: ActivatedRoute,
              private router: Router) {
    _route.params.subscribe(p => {
      this.category = docItems.getCategoryById(p['id']);

      if (this.category) {
        this._componentPageTitle.title = this.category.name;
      } else {
        this.router.navigate(['/categories']);
      }
    });
  }
}

@NgModule({
  imports: [SvgViewerModule, RouterModule, CommonModule, MdCardModule],
  exports: [ComponentList],
  declarations: [ComponentList],
  providers: [DocumentationItems, ComponentPageTitle],
})
export class ComponentListModule { }
