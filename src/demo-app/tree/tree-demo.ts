import {Component, ChangeDetectionStrategy} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'tree-demo',
  templateUrl: 'tree-demo.html',
  styleUrls: ['tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class TreeDemo {
  expandedKeys: string[] = ['apple', 'pear'];
}
