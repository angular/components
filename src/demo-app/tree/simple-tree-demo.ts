import {Component, ChangeDetectionStrategy, Directive, Input, OnInit, AfterViewInit, ViewChildren, ViewChild, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {JsonDataSource, JsonNode} from './simple-data-source';
import {SelectionModel, CdkTree, TreeControl, TreeAdapter} from '@angular/material';
import {SimpleTreeNode} from './simple-tree-node';

@Component({
  moduleId: module.id,
  selector: 'simple-tree-demo',
  templateUrl: 'simple-tree-demo.html',
  styleUrls: ['simple-tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class SimpleTreeDemo implements OnInit, AfterViewInit {
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
  _flat: boolean = true;
  @Input()
  set flat(value: boolean) {
    this._flat = value;
    this.dataSource.flat = value;

  }
  get flat() {
    return this._flat;
  }

  submit() {
    try {
      var obj = JSON.parse(this.data);
      this.dataSource.data = obj;
    } catch (e) {
      console.log(e);
    };
  }
  selection = new SelectionModel<UserData>(true, []);


  @ViewChild(CdkTree) tree: CdkTree;

  treeControl: TreeControl<UserData> = new TreeControl<UserData>();
  treeAdapter: TreeAdapter<UserData> = new TreeAdapter<UserData>(this.treeControl);
  dataSource: JsonDataSource = new JsonDataSource(this.treeAdapter);


  constructor() { }

  ngOnInit() {
    this.submit();
  }

  ngAfterViewInit() {
  }


  expandIncludeChildren: boolean = false;

  getPadding(level: number) {
    return `${(level - 1) * 45}px`;
  }

  toggleExpand(node: UserData) {
    this.treeControl.expansionModel.toggle(node);
  }

  gotoParent(node: UserData) {
    this.tree.gotoParent(node);
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
