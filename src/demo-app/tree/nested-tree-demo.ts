import {Component, ChangeDetectionStrategy, ChangeDetectorRef, Directive, Input, OnInit, AfterViewInit, ViewChildren, ViewChild, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {JsonNestedDataSource, JsonNode, JsonNestedNode} from './nested-data-source';
import {SelectionModel, CdkTree, TreeControl, FlatTreeControl, TreeAdapter, nodeDecedents, FlatNode, NestedNode, NestedTreeControl} from '@angular/material';
import {SimpleTreeNode} from './simple-tree-node';

@Component({
  moduleId: module.id,
  selector: 'nested-tree-demo',
  templateUrl: 'nested-tree-demo.html',
  styleUrls: ['nested-tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class NestedTreeDemo implements OnInit, AfterViewInit {
  data: string = `{

  "results" : [

      {

        "formatted_address" : "Puławska, Piaseczno, Polska",

        "geometry" : {

          "bounds" : {

            "northeast" : {

              "lat" : 52.0979041,

              "lng" : 21.0293984

            },

            "southwest" : {

              "lat" : 52.0749265,

              "lng" : 21.0145743

            }

          },

          "location" : {

            "lat" : 52.0860667,

            "lng" : 21.0205308

          },

          "location_type" : "GEOMETRIC_CENTER",

          "viewport" : {

            "northeast" : {

              "lat" : 52.0979041,

              "lng" : 21.0293984

            },

            "southwest" : {

              "lat" : 52.0749265,

              "lng" : 21.0145743

            }

          }

        },

        "partial_match" : true,

        "types" : [ "route" ]

      }

      ],

  "status" : "OK"

}`;


  submit() {
    try {
      var obj = JSON.parse(this.data);
      this.dataSource.data = obj;
    } catch (e) {
      console.log(e);
    };
  }
  selection = new SelectionModel<any>(true, []);


  @ViewChild(CdkTree) tree: CdkTree;

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


  expandIncludeChildren: boolean = false;

  getPadding(level: number) {
    return `${(level - 1) * 45}px`;
  }

  createArray(level: number) {
    return new Array(level);
  }

  getChildren(node: any) {
    return node.children;
  }

  key: string;
  value: string;
  currentNode: JsonNode;
  addChild() {
    this.dataSource.addChild(this.key, this.value, this.currentNode);
  }
}
