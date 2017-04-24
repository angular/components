import {
  AfterContentInit,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  Inject,
  Input,
  OnInit,
  OnDestroy,
  QueryList,
  Renderer,
  ViewChild,
  forwardRef,
  TemplateRef,
Output, EventEmitter
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {PortalHostDirective, FocusOriginMonitor, MdRipple, RippleRef} from '../core';
import {MdTree, MdNodeContext} from './tree';
import {TreeNodeState} from './tree-model';

@Directive({
  selector: 'md-tree-node',
  // templateUrl: './tree-node.html',
  // styleUrls: ['tree-node.css']
})
export class MdTreeNode implements OnInit, OnDestroy {

  @Input() templateRef: TemplateRef<MdNodeContext>;
  @Input() treeNodeState: TreeNodeState;
  @Input() node: any;
  @Input() treeControl: MdTree;

  get level() {
    return this.treeNodeState.level;
  }

  get treeNodeModel() {
    return this;
  }
  constructor(private _elementRef: ElementRef, private _renderer: Renderer,
              private _focusOriginMonitor: FocusOriginMonitor) {

    this._focusOriginMonitor.monitor(this._elementRef.nativeElement, this._renderer, true)
      .subscribe((focusOrigin) => console.log(focusOrigin));

  }

  ngAfterViewInit() {}

  // Selection related
  select() {
    console.log(`select ${this.treeNodeState.selected}`);
    this.treeControl.toggleSelect(this.node);
    console.log(`select ${this.treeNodeState.selected}`);
  }

  get selected() {
    return this.treeNodeState.selected;
  }
  set selected(value: boolean) {
    this.treeControl.select(this.node, value);
  }

  // Expansion related
  get expanded() {
    return this.treeNodeState.expanded;
  }
  set expanded(value: boolean) {
    this.treeControl.expand(this.node, value);
  }

  get expandable() {
    return !!this.node.children;
  }

  expand() {
    this.treeControl.toggleExpand(this.node);
  }

  onClick() {
    console.log(`onNode clicked ${this.node}`);
    this.expand();
  }

  onFocus() {
    console.log(`on node focus`);

  }
  indentIncremental = 20;
  get paddingStyle() {
    return `${this.treeNodeState.level * this.indentIncremental}px`;
  }

  ngOnInit() {}

  ngOnDestroy() {
    this._focusOriginMonitor.stopMonitoring(this._elementRef.nativeElement);
  }

  //
  // // Only for node hmtl
  // getPadding(level: number) {
  //   return this.treeNodeModel.isFlatTree ? `${level  *  20}px` : '0';
  // }

}
