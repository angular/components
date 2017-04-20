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
import {TreeNodeModel, TreeModel} from './tree-model';

@Component({
  selector: 'md-tree-node',
  templateUrl: './tree-node.html',
  styleUrls: ['tree-node.css']
})
export class MdTreeNode implements OnInit, OnDestroy {

  @Input() templateRef: TemplateRef<MdNodeContext>;
  @Input() treeNodeModel: TreeNodeModel<any>;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer,
              private _focusOriginMonitor: FocusOriginMonitor) {

    this._focusOriginMonitor.monitor(this._elementRef.nativeElement, this._renderer, true)
      .subscribe((focusOrigin) => console.log(focusOrigin));

  }

  ngAfterViewInit() {}

  // Selection related
  select() {
    this.treeNodeModel.select();
  }

  get isSelected() {
    return this.treeNodeModel.selected;
  }

  // Expansion related
  get isExpanded() {
    return this.treeNodeModel.expanded;
  }

  get isExpandable() {
    return this.treeNodeModel.expandable;
  }

  expand() {
    this.treeNodeModel.expand();
  }

  onClick() {
    console.log(`onNode clicked ${this.treeNodeModel.data}`);
    this.expand();
  }

  onFocus() {
    console.log(`on node focus`);

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
