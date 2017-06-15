import {Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import {JsonNestedDataSource, JsonNode, JsonNestedNode} from './nested-data-source';
import {SelectionModel, TreeControl, NestedTreeControl} from '@angular/material';
import {jsonExample} from './sample-json';

@Component({
  moduleId: module.id,
  selector: 'nested-tree-demo',
  templateUrl: 'nested-tree-demo.html',
  styleUrls: ['nested-tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class NestedTreeDemo implements OnInit, OnDestroy, AfterViewInit {
  data: string = jsonExample;

  selection = new SelectionModel<any>(true, []);

  treeControl: TreeControl;
  dataSource: JsonNestedDataSource;

  constructor(public changeDetectorRef: ChangeDetectorRef) {
    this.treeControl = new NestedTreeControl<JsonNestedNode>();
    this.dataSource = new JsonNestedDataSource();
  }

  ngOnInit() {
    this.submit();
    this.treeControl.expandChange.next([]);
  }

  ngAfterViewInit() {
    this.selection.onChange.subscribe(() => {
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.selection.onChange.unsubscribe();
  }

  submit() {
    try {
      let obj = JSON.parse(this.data);
      this.dataSource.data = obj;
    } catch (e) {
      console.log(e);
    }
  }

  key: string;
  value: string;
  currentNode: JsonNode;
  addChild() {
    this.dataSource.addChild(this.key, this.value, this.currentNode);
  }
}
