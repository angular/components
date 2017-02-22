import {
  NgModule,
  ModuleWithProviders,
  Component,
  Directive,
  Input,
  ViewChildren,
  ElementRef,
  ViewContainerRef,
  style,
  trigger,
  state,
  transition,
  animate,
  AnimationTransitionEvent,
  NgZone,
  Optional,
  OnDestroy,
  Renderer,
  OnInit,
  ChangeDetectorRef,
  QueryList,
} from '@angular/core';
import {Observable} from 'rxjs/Observable';



@Component({
  selector: 'md-tree',
  host: {
  },
  templateUrl: 'tree.html',
  styleUrls: ['tree.css'],
})
export class MdTree {
  @ViewChildren(MdTreeNode) treeNodes: QueryList<MdTreeNode>;
  /**  The keys of the nodes which are expanded. */
  _expandedKeys: string[];


  @Input()
  set expandedKeys(keys: string[]) {
    this._expandedKeys = keys;
  }
  get expandedKeys() {
    return this._expandedKeys;
  }


}

@Directive({
  selector: '[mdTreeNode]',
  host: {
  }
})
export class MdTreeNode {
  @Input()
  title: string;

  @Input()
  key: string;

  @Input()
  disabled: boolean;

  @Input()
  selected: boolean = false;

  @Input()
  expanded: boolean = false;
}