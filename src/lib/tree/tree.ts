import {
  AfterContentInit,
  AfterViewInit,
  Optional,
  ViewChild,
  Component,
  Directive,
  TemplateRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ContentChildren,
  ContentChild,
  QueryList,
  ViewContainerRef,
  Input,
  forwardRef,
  IterableDiffers,
  IterableDiffer,
  Inject,
  ViewEncapsulation,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
  IterableChangeRecord,
  DoCheck,
} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TreeDataSource, TreeAdapter} from './data-source';
import {TreeControl} from './tree-control';
import {SelectionModel, UP_ARROW, DOWN_ARROW, RIGHT_ARROW, LEFT_ARROW, HOME, ENTER, ESCAPE, FocusOriginMonitor} from '../core';
import {FocusKeyManager, Focusable} from '../core/a11y/focus-key-manager';
import {CollectionViewer} from '../core/data-table';
import {NestedNode, FlatNode} from './tree-node';
import {Subscription} from 'rxjs/Subscription';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {RxChain, debounceTime} from '../core/rxjs/index';
import {combineLatest} from 'rxjs/observable/combineLatest';

/** Height of each row in pixels (48 + 1px border) */
export const ROW_HEIGHT = 49;

/** Amount of rows to buffer around the view */
export const BUFFER = 3;

/**
 * Node template
 */
@Directive({
  selector: '[cdkNodeDef]'
})
export class CdkNodeDef {
  constructor(public template: TemplateRef<any>,
              public tree: CdkTree) {}
}

// TODO: Role should be group for expandable ndoes
@Component({
  selector: 'cdk-node',
  template: '<ng-content></ng-content>',
  host: {
    'role': 'treeitem',
    '(focus)': 'focus()',
    '(blur)': 'hasFocus=false',
    'tabindex': '0',
  }
})
export class CdkNode  implements Focusable, OnDestroy {
  @Input('cdkNode')
  set data(v: any) {
    this._data = v;
    if ('level' in v) {
      this._role = this._data.expandable ? 'group' : 'treeitem';
    } else {
      // Nested node
      this._data.getChildren().subscribe((children) => {
        this._role = !!children ? 'group' : 'treeitem';
      })
    }
  }

  get data(): any {
    return this._data;
  }
  _data: any;

  @Input()
  get role() {
    return this._role;
  }
  _role: string;

  get offsetTop() {
    return this.elementRef.nativeElement.offsetTop;
  }

  constructor(private elementRef: ElementRef,
              private renderer: Renderer2,
              public tree: CdkTree,
              private _focusOriginMonitor: FocusOriginMonitor) {
    this.renderer.addClass(elementRef.nativeElement, 'mat-data');
    this._focusOriginMonitor.monitor(this.elementRef.nativeElement, this.renderer, true);
  }


  ngOnDestroy() {
    this._focusOriginMonitor.stopMonitoring(this.elementRef.nativeElement);
  }

  /** Focuses the menu item. */
  focus(): void {
    // this.elementRef.nativeElement.focus();
  }
}

/**
 * Placeholder for cdk-nodes
 */
@Directive({
  selector: '[cdkNodePlaceholder]'
})
export class CdkNodePlaceholder {
  constructor(public viewContainer: ViewContainerRef) { }
}

/**
 * Nested node, add children to `mdNodePlaceholder` in template
 */
@Directive({
  selector: '[cdkNestedNode]'
})
export class CdkNestedNode implements AfterContentInit, OnDestroy {
  @Input('cdkNestedNode') node: NestedNode;

  @ContentChildren(CdkNodePlaceholder) nodePlaceholder: QueryList<CdkNodePlaceholder>;

  _childrenSubscription: Subscription;

  constructor(@Inject(forwardRef(() => CdkTree)) private tree: CdkTree,
              public changeDetectorRef: ChangeDetectorRef) {}

  viewContainer: ViewContainerRef;

  ngAfterViewInit() {
    // this.tree.treeControl.expandChange.subscribe(() => this.changeDetectorRef.detectChanges());
  }

  ngAfterContentInit() {
    this._childrenSubscription =
        combineLatest([this.node.getChildren(), this.nodePlaceholder.changes])
        .subscribe((results) => {
          // console.log(`add children from getChildren & nodePlaceholder subscription`);
     this._addChildrenNodes(results[0]);
    });
  }

  _addChildrenNodes(children: NestedNode[]) {
    if (this.nodePlaceholder.length) {
      this.viewContainer = this.nodePlaceholder.first.viewContainer;
      this.viewContainer.clear();
      if (children) {
        children.forEach((child, index) => {
          this.tree.addNode(this.viewContainer, child, index);
        });

      }
    } else {
      this.clear();
    }
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    if (this._childrenSubscription) {
      this._childrenSubscription.unsubscribe();
    }
    this.clear();
  }

  clear() {
    if (this.viewContainer) {
      this.viewContainer.clear();
    }
  }
}

/**
 * Indent for the children
 */
@Directive({
  selector: '[cdkNodePadding]',
  host: {
    '[style.padding-left]': 'paddingIndent',
  },
})
export class CdkNodePadding {
  @Input('cdkNodePadding') level: number;

  @Input('cdkNodePaddingIndex') indent: number = 28;

  get paddingIndent() {
    let nodeLevel = (this.node.data && this.node.data.level) ? this.node.data.level : null;
    let level = this.level || nodeLevel;
    return level ? `${level * this.indent}px` : '';
  }

  constructor(public node: CdkNode) {}
}


/**
 * Node trigger
 */
@Directive({
  selector: '[cdkNodeTrigger]',
  host: {
    'class': 'mat-node-trigger',
    '(click)': 'trigger($event)',
  }
})
export class CdkNodeTrigger {
  @Input('cdkNodeTrigger') node: any;
  @Input('cdkNodeTriggerRecursive') recursive: boolean = false;
  @Input('cdkNodeTriggerSelection') selection: SelectionModel<any>;

  constructor(@Inject(forwardRef(() => CdkTree)) private tree: CdkTree) {}

  trigger(_: Event) {
    this.selection.toggle(this.node);
     if (this.recursive) {
       this.selectRecursive(this.node, this.selection.isSelected(this.node));
     }
  }

  selectRecursive(node: any, select: boolean) {
    let decedents = this.tree.treeControl.getDecedents(node);
    decedents.forEach((child) => {
      select ? this.selection.select(child) : this.selection.deselect(child);
    });
  }
}

/**
 * Select trigger
 */
@Directive({
  selector: '[mdNodeSelectTrigger]',
  host: {
    'class': 'mat-node-select-trigger',
    '(change)': 'trigger($event)',
    '(click)': '$event.stopPropagation()',
  }
})
export class MdNodeSelectTrigger extends CdkNodeTrigger{
  @Input('mdNodeSelectTrigger') node: any;
}

import {By} from '@angular/platform-browser';

@Component({
  selector: 'cdk-tree',
  styleUrls: ['./tree.css'],
  template: `
    <ng-container cdkNodePlaceholder></ng-container>
    <ng-template #emptyNode><div class="mat-placeholder"></div></ng-template>
  `,
  host: {
    'role': 'tree',
    'class': 'mat-tree',
    '(focus)': 'focus()',
    '(keydown)': 'handleKeydown($event)'
  },
  encapsulation: ViewEncapsulation.None,
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class CdkTree implements CollectionViewer, AfterViewInit, OnInit {

  _viewInitialized: boolean = false;

  /** Data source */
  @Input() dataSource: TreeDataSource<any>;

  /** The tree controller */
  @Input() treeControl: TreeControl;

  /** View changed for CollectionViewer */
  viewChange = new BehaviorSubject({start: 0, end: 20});

  /** Data differerences for the ndoes */
  private _dataDiffer: IterableDiffer<any>;

  // Focus related
  _keyManager: FocusKeyManager;

  orderedNodes: QueryList<CdkNode> = new QueryList<CdkNode>();

  @ContentChildren(CdkNode, {descendants: true}) items: QueryList<CdkNode>;
  @ContentChildren(CdkNodeDef) nodeDefinitions: QueryList<CdkNodeDef>;
  @ViewChild(CdkNodePlaceholder) nodePlaceholder: CdkNodePlaceholder;
  @ViewChild('emptyNode') emptyNodeTemplate: TemplateRef<any>;

  constructor(private _differs: IterableDiffers, private elementRef: ElementRef,
              private changeDetectorRef: ChangeDetectorRef) {
    this._dataDiffer = this._differs.find([]).create();
  }

  ngOnInit() {
    RxChain.from(fromEvent(this.elementRef.nativeElement, 'scroll'))
      .call(debounceTime, 100)
      .subscribe(() => this.scrollEvent());
  }

  ngDoCheck() {
    if (this.dataSource && this._viewInitialized) {
      this.dataSource.connect(this).subscribe((result: any[]) => {
        this.renderNodeChanges(result);
      });
    }

  }

  ngAfterViewInit() {
    // this.treeControl.expandChange.subscribe(() => this.changeDetectorRef.detectChanges());
    this._viewInitialized = true;
    this.items.changes.subscribe((items) => {
      let nodes = items.toArray();

      nodes.sort((a, b) => {
        return a.offsetTop - b.offsetTop;
      });
      this.orderedNodes.reset(nodes);

      let activeItem = this._keyManager ? this._keyManager.activeItem : null;
      this._keyManager = new FocusKeyManager(this.orderedNodes);
      if (activeItem instanceof CdkNode) {
        this.updateFocusedNode(activeItem);
      }
      this.changeDetectorRef.detectChanges();
    })
  }

  renderNodeChanges(dataNodes: FlatNode[]) {
    const changes = this._dataDiffer.diff(dataNodes);
    if (!changes) { return; }

    const oldScrollTop = this.elementRef.nativeElement.scrollTop;
    changes.forEachOperation(
      (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
        if (item.previousIndex == null) {
          this.addNode(this.nodePlaceholder.viewContainer, dataNodes[currentIndex], currentIndex);
        } else if (currentIndex == null) {
          this.nodePlaceholder.viewContainer.remove(adjustedPreviousIndex);
        } else {
          const view = this.nodePlaceholder.viewContainer.get(adjustedPreviousIndex);
          if (view) {
            this.nodePlaceholder.viewContainer.move(view, currentIndex);
          }
        }
      });

    // Scroll changes in the process of adding/removing rows. Reset it back to where it was
    // so that it (1) it does not shift and (2) a scroll event does not get triggered which
    // would cause a loop.
    this.elementRef.nativeElement.scrollTop = oldScrollTop;
    this.changeDetectorRef.detectChanges();
  }

  addNode(viewContainer: ViewContainerRef, data: any, currentIndex: number) {
    if (!!data) {
      this._addNodeInContainer(viewContainer, data, currentIndex);
    } else {
      viewContainer.createEmbeddedView(this.emptyNodeTemplate, {}, currentIndex);
    }
  }

  _addNodeInContainer(container: ViewContainerRef, data: any, currentIndex: number) {
    let node = this.getNodeDefForItem(data);
    let context = {
      $implicit: data
    };
    container.createEmbeddedView(node.template, context, currentIndex);
  }

  getNodeDefForItem(_) {
    // proof-of-concept: only supporting one row definition
    return this.nodeDefinitions.first;
  }

  scrollEvent() {
    const scrollTop = this.elementRef.nativeElement.scrollTop;
    const elementHeight = this.elementRef.nativeElement.getBoundingClientRect().height;

    const topIndex = Math.floor(scrollTop / ROW_HEIGHT);

    const view = {
      start: Math.max(topIndex - BUFFER, 0),
      end: Math.ceil(topIndex + (elementHeight / ROW_HEIGHT)) + BUFFER
    };

    this.viewChange.next(view);
  }

  printData() {
    this.items.forEach((node) => console.log(node.data));
  }

  // Key related
  // TODO(tinagao): Work on keyboard traversal
  handleKeydown(event) {
    if (event.keyCode == UP_ARROW) {
      this._keyManager.setPreviousItemActive();
    } else if (event.keyCode == DOWN_ARROW) {
      this._keyManager.setNextItemActive();
    } else if (event.keyCode == RIGHT_ARROW) {
      let activeNode = this._keyManager.activeItem;
      if (activeNode instanceof CdkNode) {
        this.treeControl.expand(activeNode.data);
        this.changeDetectorRef.detectChanges();
      }
    } else if (event.keyCode == LEFT_ARROW) {
      let activeNode = this._keyManager.activeItem;
      if (activeNode instanceof CdkNode) {
        this.treeControl.collapse(activeNode.data);
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  updateFocusedNode(node: CdkNode) {
    let index = this.orderedNodes.toArray().indexOf(node);
    if (this._keyManager && index > -1) {
      this._keyManager.setActiveItem(Math.min(this.orderedNodes.length -1, index));
    }
  }
}
