import {Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {JsonDataSource, JsonNode, JsonFlatNode} from './simple-data-source';
import {SelectionModel, CdkTree, TreeControl, FlatTreeControl} from '@angular/material';
import {jsonExample} from './sample-json';
import {Subscription} from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'simple-tree-demo',
  templateUrl: 'simple-tree-demo.html',
  styleUrls: ['simple-tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class SimpleTreeDemo implements OnInit, AfterViewInit {
  data: string = jsonExample;

  selection = new SelectionModel<any>(true, []);


  @ViewChild(CdkTree) tree: CdkTree;

  treeControl: TreeControl;

  dataSource: JsonDataSource;

  _selectSubscription: Subscription;


  constructor(public changeDetectorRef: ChangeDetectorRef) {
    this.treeControl = new FlatTreeControl<JsonFlatNode>();
    this.dataSource = new JsonDataSource(this.treeControl as FlatTreeControl<JsonFlatNode>);
  }

  ngOnInit() {
    this.submit();
    this.treeControl.expandChange.next([]);
  }

  ngAfterViewInit() {
    this._selectSubscription = this.selection.onChange.subscribe(() => {
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this._selectSubscription.unsubscribe();
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
