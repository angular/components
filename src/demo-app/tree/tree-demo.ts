import {Component, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import {TemplatePortalDirective, Portal} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'tree-demo',
  templateUrl: 'tree-demo.html',
  styleUrls: ['tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class TreeDemo {
  @ViewChild(TemplatePortalDirective) nodeTemplate: Portal<any>;
  expandedKeys: string[] = ['apple', 'pear'];
}
