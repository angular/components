import {OnInit, Component, ChangeDetectionStrategy, ChangeDetectorRef, Directive, Input, ViewChildren, ViewChild, QueryList, TemplateRef, AfterContentInit } from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {JsonDataSource} from './simple-data-source'
import {MdNodePlaceholder, SelectionModel, CdkTree} from '@angular/material';

@Component({
    moduleId: module.id,
    selector: 'simple-nested-node',
    templateUrl: 'simple-nested-node.html',
    styleUrls: ['simple-nested-node.css'],
})
export class SimpleNestedTreeNode {
    @Input() node: any;
    @Input() expandable: boolean;
    @Input() expandRecursive: boolean;
    @Input() selection: SelectionModel<any>;
    @Input() dataSource: JsonDataSource;

    constructor(public tree: CdkTree) {}
}
