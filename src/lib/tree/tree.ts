import {
  NgModule,
  ModuleWithProviders,
  Component,
  Directive,
  Input,
  ContentChildren,
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
import { BrowserModule } from '@angular/platform-browser';

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

@Component({
  selector: 'md-tree',
  host: {
  },
  templateUrl: 'tree.html',
  styleUrls: ['tree.css'],

})
export class MdTree {
  @ContentChildren(MdTreeNode) treeNodes: QueryList<MdTreeNode>;

  /**  The keys of the nodes which are expanded. */
  _expandedKeys: string[];


  @Input()
  get expandedKeys() {
    return this._expandedKeys;
  }
  set expandedKeys(keys: string[]) {
    this._expandedKeys = keys;
  }
}


@NgModule({
  imports: [BrowserModule],
  exports: [MdTree, MdTreeNode],
  declarations: [MdTree, MdTreeNode],
})
export class MdTreeModule implements OnInit {
  @ContentChildren(MdTreeNode) treeNodes: QueryList<MdTreeNode>;

  ngOnInit() {
    console.log(this.treeNodes.length);
  }

}
