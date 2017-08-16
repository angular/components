import {Component, NgModule, OnInit} from '@angular/core';
import {ActivatedRoute, RouterModule, Router} from '@angular/router';
import {GuideItem, GuideItems} from '../../shared/guide-items/guide-items';
import {FooterModule} from '../../shared/footer/footer';
import {DocViewerModule} from '../../shared/doc-viewer/doc-viewer-module';
import {TableOfContentsModule} from '../../shared/table-of-contents/table-of-contents.module';
import {ComponentPageTitle} from '../page-title/page-title';

@Component({
  selector: 'guide-viewer',
  templateUrl: './guide-viewer.html',
  styleUrls: ['./guide-viewer.scss'],
})
export class GuideViewer implements OnInit {
  guide: GuideItem;

  constructor(private _route: ActivatedRoute,
              private _componentPageTitle: ComponentPageTitle,
              private router: Router,
              public guideItems: GuideItems) {
    _route.params.subscribe(p => {
      this.guide = guideItems.getItemById(p['id']);

      if (!this.guide) {
        this.router.navigate(['/guides']);
      }
    });
  }

  ngOnInit(): void {
    this._componentPageTitle.title = this.guide.name;
  }
}

@NgModule({
  imports: [DocViewerModule, FooterModule, RouterModule, TableOfContentsModule],
  exports: [GuideViewer],
  declarations: [GuideViewer],
  providers: [GuideItems, ComponentPageTitle],
})
export class GuideViewerModule {}
