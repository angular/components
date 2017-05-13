import {TreeDataSource, MdTreeViewData} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/combineLatest';
import {PeopleDatabase, UserData} from './person-database';
import {
    IterableDiffers,
    IterableDiffer,
} from '@angular/core';

export class JsonNode {
    key: string;
    level: number;
    value: any;
    children: any[];
}

export class NestedJsonDataSource extends TreeDataSource<any> {
    dottedLineLevels = new Map<any, number[]>();
    flat: boolean = false;

    _renderedData: any[] = [];

    _filteredData = new BehaviorSubject<any>([]);
    get filteredData(): any { return this._filteredData.value; }


    set data(value: any) {
        let tree = this.buildJsonTree(value);
        this._filteredData.next(tree);
    }

    constructor() {
        super();
    }

    connectTree(viewChange: Observable<MdTreeViewData>): Observable<UserData[]> {
        return this._filteredData;
    }

    getChildren(node: any): any[] {
        if (!!node.children && node.children.length == 0) {
            setTimeout(() => {
                let data = this.filteredData;
                node.children.push(this.buildJsonTree(`{'addedNode': 'true'}`));
                this._filteredData.next(data);
            }, 1000);
        }
        return node.children;
    }

    // flattenNodes(structuredData: Observable<any[]>): Observable<any[]> {
    //     return Observable.combineLatest(structuredData, this.expandChange).map((result: any[]) => {
    //         let [dataNodes, selectionChange] = result;
    //         let flatNodes: any[] = [];
    //         dataNodes.forEach((node: any) => {
    //             this._flattenNode(node, 0, flatNodes);
    //         });
    //         return this.flat ? flatNodes : dataNodes;
    //     });
    // }
    //
    // _flattenNode(node: any, level: number, flatNodes: any[]) {
    //     console.log(`flatten data ${data}`);
    //     let children = this.getChildren(node);
    //     let selected = this.expansionModel.isSelected(node);
    //     this.levelMap.set(node, level);
    //
    //     this.indexMap.set(node, flatNodes.length);
    //     if (level == 0) {
    //         flatNodes.push(node);
    //     }
    //
    //
    //     if (!!children && selected) {
    //
    //         children.forEach((child, index) => {
    //             this.parentMap.set(child, node);
    //             this._flattenNode(child, level + 1, flatNodes);
    //
    //             let dottedLineLevels = this.dottedLineLevels.get(node)|| [];
    //             dottedLineLevels = dottedLineLevels.slice();
    //             if (index != children.length - 1) {
    //                 dottedLineLevels.push(level);
    //             }
    //             this.dottedLineLevels.set(child, dottedLineLevels);
    //
    //         });
    //     }
    // }

    childrenMap: Map<string, string[]> = new Map<string, string[]>();

    buildJsonTree(value: any, level: number = 0) {
        let data: any[] = [];
        for (let k in value) {
            let v = value[k];
            let node = new JsonNode();
            node.level = level;
            node.key = `${k}`;
            if (v === null || v === undefined) {
                // no action
            } else if (typeof v === 'object') {
                node.children = this.buildJsonTree(v, level + 1);
            } else {
                node.value = v;
            }
            data.push(node);
        }
        return data;
    }

    addChild(key: string, value: string, node: JsonNode) {
        console.log(node.children);
        if (!node.children) {
            node.children = [];
        }
        let child = new JsonNode();
        child.key = key;
        child.value = value;
        node.children.push(child);
        console.log(node);
        console.log(this.filteredData);
        this._filteredData.next(this._filteredData.value);
    }

    editChild(key: string, value: string, node: JsonNode) {
        node.key = key;
        node.value = value;
        this._filteredData.next(this._filteredData.value);
    }
}