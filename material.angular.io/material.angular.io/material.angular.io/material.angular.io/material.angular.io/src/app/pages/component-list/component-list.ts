import {Component, NgModule} from '@angular/core';
import {
  DocumentationItems,
  DocCategory
} from '../../shared/documentation-items/documentation-items';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {ComponentPageTitle} from '../page-title/page-title';
import {SvgViewerModule} from '../../shared/svg-viewer/svg-viewer';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material';
import {combineLatest} from 'rxjs';

@Component({
  selector: 'app-components',
  templateUrl: './component-list.html',
  styleUrls: ['./component-list.scss']
})
export class ComponentList {
  category: DocCategory;
  section: string;

  constructor(public docItems: DocumentationItems,
              private _componentPageTitle: ComponentPageTitle,
              private _route: ActivatedRoute,
              public router: Router) {
    combineLatest(_route.pathFromRoot.map(route => route.params), Object.assign)
      .subscribe(p => {
        this.category = docItems.getCategoryById(p['id']);
        this.section = p['section'];

        if (this.category) {
          this._componentPageTitle.title = this.category.name;
        } else {
          this.router.navigate(['../'], {relativeTo: this._route});
        }
      });
  }
}

@NgModule({
  imports: [SvgViewerModule, RouterModule, CommonModule, MatCardModule],
  exports: [ComponentList],
  declarations: [ComponentList],
  providers: [DocumentationItems, ComponentPageTitle],
})
export class ComponentListModule { }
