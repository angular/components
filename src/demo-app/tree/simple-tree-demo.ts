import {Component, ChangeDetectionStrategy, Directive, Input, OnInit, ViewChildren, ViewChild, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {JsonDataSource} from './simple-data-source'
import {SelectionModel, CdkTree} from '@angular/material';
import {SimpleTreeNode} from './simple-tree-node';

@Component({
  moduleId: module.id,
  selector: 'simple-tree-demo',
  templateUrl: 'simple-tree-demo.html',
  styleUrls: ['simple-tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class SimpleTreeDemo implements OnInit {
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
  dataSource: JsonDataSource = new JsonDataSource();

  @ViewChild(CdkTree) tree: CdkTree;

  constructor() { }

  ngOnInit() {
    this.submit();
  }


  expandIncludeChildren: boolean = true;

  get expansionModel() {
    return this.dataSource.expansionModel;
  }

  getPadding(level: number) {
    return `${(level - 1) * 45}px`;
  }

  toggleExpand(node: UserData) {
    this.dataSource.expansionModel.toggle(node);
  }

  gotoParent(node: UserData) {
    this.tree.gotoParent(node);
  }

  expandAll() {
    this.tree.toggleAll(true);
  }

  collapseAll() {
    this.tree.toggleAll(false);
  }

  expand(node: UserData) {
    this.tree.toggleAll(true, node);
  }

  collapse(node: UserData) {
    this.tree.toggleAll(false, node);
  }

  createArray(level: number) {
    return new Array(level);
  }

  getChildren(node: any) {
    return node.children;
  }
}
