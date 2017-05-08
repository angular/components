import {OnInit, Component, ChangeDetectionStrategy, Directive, Input, ViewChildren, ViewChild, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {JsonDataSource} from './simple-data-source'
import {MdNodePlaceholder, SelectionModel, MdTree} from '@angular/material';

@Component({
    moduleId: module.id,
    selector: 'simple-nested-node',
    templateUrl: 'simple-nested-node.html',
    styleUrls: ['simple-nested-node.css'],
    changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class SimpleNestedTreeNode implements OnInit {


    @ViewChild(MdNodePlaceholder) nodePlaceholder: MdNodePlaceholder;
    @Input() flat: boolean;
    @Input() node: any;
    @Input() level: number;
    @Input() expandable: boolean;
    @Input() expandIncludeChildren: boolean;
    @Input() selection: SelectionModel<any>;
    @Input() dataSource: JsonDataSource;

    constructor(public tree: MdTree) {}


    createArray(level: number) {
        return new Array(level);
    }

    getChildren(node: any) {
        return node.children;
    }

    dotline(node: any, index: number) {
        let data = this.dataSource.dottedLineLevels.get(node);
        return !!data && data.indexOf(index) != -1;
    }


    ngOnInit() {
        let children = this.dataSource.getChildren(this.node);
        if (!!children) {
            children.forEach((child, index) => {
                // Add children
                console.log(`add node in container `);
                this.tree.addNodeInContainer(this.nodePlaceholder.viewContainer, child, index);
            });
        }


    }

    getSpecial(node: any, index: number) {
        let levels = this.dataSource.dottedLineLevels.get(node);
        return !!levels && levels.indexOf(index) != -1;
    }
}
