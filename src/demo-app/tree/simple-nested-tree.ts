import {Component, ChangeDetectionStrategy, Directive, Input, OnInit, ViewChildren, ViewChild, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {NestedJsonDataSource} from './nested-data-source'
import {SelectionModel, CdkTree} from '@angular/material';
import {SimpleTreeNode} from './simple-tree-node';

@Component({
    moduleId: module.id,
    selector: 'simple-nested-tree-demo',
    templateUrl: 'simple-nested-tree.html',
    styleUrls: ['simple-nested-tree.css'],
//    changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class SimpleNestedTreeDemo implements OnInit {
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

    expandRecursive: boolean = true;
    selectRecursive: boolean = true;

    submit() {
        try {
            var obj = JSON.parse(this.data);
            this.dataSource.data = obj;
        } catch (e) {
            console.log(e);
        };
    }
    selection = new SelectionModel<UserData>(true, []);
    dataSource: NestedJsonDataSource = new NestedJsonDataSource();

    @ViewChild(CdkTree) tree: CdkTree;

    constructor() { }

    ngOnInit() {
        this.submit();
    }

    expandAll() {
        this.tree.toggleAll(true);
    }

    collapseAll() {
        this.tree.toggleAll(false);
    }

    get expansionModel() {
        return this.dataSource.expansionModel;
    }
}
