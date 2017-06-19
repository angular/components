import {
  AfterContentInit,
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
  IterableChangeRecord
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/combineLatest';
import {TreeDataSource, TreeAdapter} from './data-source';
import {TreeControl} from './tree-control';
import {SelectionModel, UP_ARROW, DOWN_ARROW, RIGHT_ARROW, LEFT_ARROW, HOME, ENTER, ESCAPE, FocusOriginMonitor} from '../core';
import {FocusKeyManager, Focusable} from '../core/a11y/focus-key-manager';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';
import {CollectionViewer} from './data-source';
import {NestedNode, FlatNode} from './tree-node';
import {Subscription} from 'rxjs/Subscription';

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
    'role': 'treeitem'
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

  _role: string;

  constructor(private elementRef: ElementRef,
              private renderer: Renderer2,
              public tree: CdkTree,
              private _focusOriginMonitor: FocusOriginMonitor) {
    this.renderer.addClass(elementRef.nativeElement, 'mat-data');
    this._focusOriginMonitor.monitor(this.elementRef.nativeElement, this.renderer, true);
  }

  @Input()
  get role() {
    return this._role;
  }

  ngOnDestroy() {
    this._focusOriginMonitor.stopMonitoring(this.elementRef.nativeElement);
  }

  /** Focuses the menu item. */
  focus(): void {
  //  this._getHostElement().focus();
  }

  /** Returns the host DOM element. */
  _getHostElement(): HTMLElement {
    return this.elementRef.nativeElement;
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
export class CdkNestedNode implements OnInit, OnDestroy {
  @Input('cdkNestedNode') node: NestedNode;

  @ContentChild(CdkNodePlaceholder) nodePlaceholder: CdkNodePlaceholder;

  _childrenSubscription: Subscription;

  constructor(@Inject(forwardRef(() => CdkTree)) private tree: CdkTree) {}

  ngOnInit() {
    this._childrenSubscription = this.node.getChildren().subscribe((children) => {

      this.nodePlaceholder.viewContainer.clear();
      if (children) {
        children.forEach((child, index) => {
          console.log(child);
          this.tree.addNode(this.nodePlaceholder.viewContainer, child, index);
        });
      }
    });
  }

  ngOnDestroy() {
    if (this._childrenSubscription) {
      // this._childrenSubscription.unsubscribe();
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

  trigger(event: Event) {
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
    '(keydown)': 'handleKeydown($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CdkTree implements CollectionViewer {
  @Input() dataSource: TreeDataSource<any>;
  @Input() treeControl: TreeControl;

  /** View changed for CollectionViewer */
  viewChanged = new BehaviorSubject({start: 0, end: 20});

  // Data differ
  private _dataDiffer: IterableDiffer<any> = null;

  // Focus related
  private _keyManager: FocusKeyManager;


  @ContentChildren(CdkNode) items: QueryList<CdkNode>;
  @ContentChildren(CdkNodeDef) nodeDefinitions: QueryList<CdkNodeDef>;
  @ViewChild(CdkNodePlaceholder) nodePlaceholder: CdkNodePlaceholder;
  @ViewChild('emptyNode') emptyNodeTemplate: TemplateRef<any>;

  constructor(private _differs: IterableDiffers, private elementRef: ElementRef,
              private changeDetectorRef: ChangeDetectorRef) {
    this._dataDiffer = this._differs.find([]).create();
  }

  ngOnInit() {
    Observable.fromEvent(this.elementRef.nativeElement, 'scroll')
      .debounceTime(100)
      .subscribe(() => this.scrollEvent());
  }

  ngAfterViewInit() {
    // Focus related
    this._keyManager = new FocusKeyManager(this.items).withWrap();

    this.dataSource.connect(this).subscribe((result: any[]) => {
      this.renderNodeChanges(result);
    });
  }


  renderNodeChanges(dataNodes: FlatNode[]) {
    console.time('Rendering rows');
    const changes = this._dataDiffer.diff(dataNodes);
    if (!changes) { return; }

    const oldScrollTop = this.elementRef.nativeElement.scrollTop;
    changes.forEachOperation(
      (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
        if (item.previousIndex == null) {
          console.log('Adding node ');
          this.addNode(this.nodePlaceholder.viewContainer, dataNodes[currentIndex], currentIndex);
        } else if (currentIndex == null) {
          console.log('Removing a node ');
          this.nodePlaceholder.viewContainer.remove(adjustedPreviousIndex);
        } else {
          console.log('Moving a node');
          const view = this.nodePlaceholder.viewContainer.get(adjustedPreviousIndex);
          this.nodePlaceholder.viewContainer.move(view, currentIndex);
        }
      });

    // Scroll changes in the process of adding/removing rows. Reset it back to where it was
    // so that it (1) it does not shift and (2) a scroll event does not get triggered which
    // would cause a loop.
    this.elementRef.nativeElement.scrollTop = oldScrollTop;
    this.changeDetectorRef.detectChanges();
    console.timeEnd('Rendering nodes');
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

  getNodeDefForItem(item: any) {
    // proof-of-concept: only supporting one row definition
    return this.nodeDefinitions.first;
  }

  /** TODO(tinayuangao): Make sure scrollable works */
  scrollToTop() {
    this.elementRef.nativeElement.scrollTop = 0;
  }

  scrollEvent() {
    const scrollTop = this.elementRef.nativeElement.scrollTop;
    const elementHeight = this.elementRef.nativeElement.getBoundingClientRect().height;

    const topIndex = Math.floor(scrollTop / ROW_HEIGHT);

    const view = {
      start: Math.max(topIndex - BUFFER, 0),
      end: Math.ceil(topIndex + (elementHeight / ROW_HEIGHT)) + BUFFER
    };

    this.viewChanged.next(view);
  }

  scrollToIndex(topIndex: number) {
    const elementHeight = this.elementRef.nativeElement.getBoundingClientRect().height;
    const view = {
      start: Math.max(topIndex - BUFFER, 0),
      end: Math.ceil(topIndex + (elementHeight / ROW_HEIGHT)) + BUFFER
    };
    this.viewChanged.next(view);
    this.elementRef.nativeElement.scrollTop = topIndex * ROW_HEIGHT;
  }

  // Key related
  // TODO(tinagao): Work on keyboard traversal
  handleKeydown(event) {
    if (event.keyCode == UP_ARROW) {
      this._keyManager.setPreviousItemActive();
      // Move to previous index scrollToIndex(focusIndex - 1)
      console.log(`// Move to previous index scrollToIndex(focusIndex - 1)`);
    } else if (event.keyCode == DOWN_ARROW) {
      this._keyManager.setNextItemActive();
      console.log(`// Move to next index scrollToIndex(focusIndex + 1)`);
      // Move to next index scrollToIndex(focusIndex + 1)
    } else if (event.keyCode == RIGHT_ARROW) {
      console.log(`// If focus expandable, expand, scrollToIndex(focusIndex + 1)`);
      // If focus expandable, expand, scrollToIndex(focusIndex + 1)
    } else if (event.keyCode == LEFT_ARROW) {
      console.log(`// goToParent(focusIndex), collapse parent node`);
      // goToParent(focusIndex), collapse parent data
    }
  }
  /** Expand related end */
}
