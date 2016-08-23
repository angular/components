import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'collapse-demo',
  templateUrl: 'collapse-demo.html',
  styles: [`
    .collapse { display: none; }
    .collapse.in { display: block; }
    .collapsing { position: relative; height: 0; overflow: hidden; -moz-transition: height, visibility 0.35s ease; -o-transition: height, visibility 0.35s ease; -webkit-transition: height, visibility 0.35s ease; transition: height, visibility 0.35s ease; }
  `],
  encapsulation: ViewEncapsulation.None
})
export class CollapseDemo {
  private isCollapsedContent: boolean = false;
  private isCollapsedImage: boolean = true;
}
