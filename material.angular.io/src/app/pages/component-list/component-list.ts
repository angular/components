import {Component, NgModule} from '@angular/core';
import {
  DocumentationItems,
  DocCategory
} from '../../shared/documentation-items/documentation-items';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {ComponentPageTitle} from '../page-title/page-title';
import {SvgViewerModule} from '../../shared/svg-viewer/svg-viewer';
import {CommonModule} from '@angular/common';
import {MatCardModule } from '@angular/material/card';
import {combineLatest} from 'rxjs';

@Component({
  selector: 'app-components',
  templateUrl: './component-list.html',
  styleUrls: ['./component-list.scss']
})
export class ComponentList {
  category: DocCategory | undefined;
  section: string;

  constructor(public docItems: DocumentationItems,
              private _componentPageTitle: ComponentPageTitle,
              private _route: ActivatedRoute,
              public router: Router) {
    combineLatest(_route.pathFromRoot.map(route => route.params), Object.assign)
      .subscribe((routeData: {[key: string]: string}) => {
        this.category = docItems.getCategoryById(routeData['id']);
        this.section = routeData['section'];

        if (this.category) {
          this._componentPageTitle.title = this.category.name;
        } else {
          this.router.navigate(['../'], {relativeTo: this._route});
        }
      });
  }
}

@NgModule({
  imports: [CommonModule, SvgViewerModule, MatCardModule, RouterModule],
  exports: [ComponentList],
  declarations: [ComponentList],
  providers: [DocumentationItems],
})
export class ComponentListModule { }
