import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {SelectionModel, CdkTree} from '@angular/material';
import {JsonNestedNode} from './nested-data-source'
import {Subscription} from 'rxjs/Subscription';


@Component({
  moduleId: module.id,
  selector: 'nested-tree-node',
  templateUrl: 'nested-tree-node.html',
  styleUrls: ['nested-tree-node.css'],
  //changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class NestedTreeNode {
  @Input() node: any;
  @Input() selection: SelectionModel<any>;

  constructor(public tree: CdkTree, public detectorRef: ChangeDetectorRef) {

  }

  _subscription: Subscription;

  ngOnInit() {
    this._subscription = this.treeControl.expandChange.subscribe(() => {
      this.detectorRef.detectChanges();
    })
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  get dataSource() { return this.tree.dataSource; }
  get treeControl() { return this.tree.treeControl; }

  get selected() { return this.selection.isSelected(this.node); }

  selectNode(node: any) {
    this.selection.toggle(node);
    let decedents = this.treeControl.getDecedents(node);
    decedents.forEach((decedent: JsonNestedNode) => {
      this.selected ? this.selection.select(decedent) : this.selection.deselect(decedent);
    });
  }

  toggleExpand(node: any) {
    if (this.treeControl.expanded(node)) {
      this.treeControl.toggleDecedents(node);
    } else {
      this.treeControl.toggleDecedents(node);
      // this.treeControl.expand(node);
    }
  }
}
