import {Component, NgModule} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {GuideItem, GuideItems} from '../../shared/guide-items/guide-items';
import {FooterModule} from '../../shared/footer/footer';
import {DocViewerModule} from '../../shared/doc-viewer/doc-viewer-module';


@Component({
  selector: 'guide-viewer',
  templateUrl: './guide-viewer.html',
  styleUrls: ['./guide-viewer.scss'],
})
export class GuideViewer {
  guide: GuideItem;

  constructor(private _route: ActivatedRoute,
              private router: Router,
              public guideItems: GuideItems) {
    _route.params.subscribe(p => {
      this.guide = guideItems.getItemById(p['id']);

      if (!this.guide) {
        this.router.navigate(['/guides']);
      }
    });
  }
}

@NgModule({
  imports: [DocViewerModule, FooterModule, RouterModule],
  exports: [GuideViewer],
  declarations: [GuideViewer],
  providers: [GuideItems],
})
export class GuideViewerModule {}
