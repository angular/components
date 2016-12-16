import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-components',
  templateUrl: './component-viewer.html',
  styleUrls: ['./component-viewer.scss']
})
export class ComponentViewer {
  componentId: string;

  constructor(private _route: ActivatedRoute) {
    _route.params.first().subscribe(p => {
      this.componentId = p['id'];
    });
  }
}
