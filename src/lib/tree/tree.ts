import {
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
  SimpleChanges,
  IterableDiffer,
  Inject,
  ViewEncapsulation,
  ElementRef,
  Renderer,
  IterableChanges,
  IterableChangeRecord
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/combineLatest';
import {TreeDataSource, MdTreeViewData} from './data-source';
import {SelectionModel, SelectionChange} from '../core';

/** Height of each row in pixels (48 + 1px border) */
export const ROW_HEIGHT = 49;

/** Amount of rows to buffer around the view */
export const BUFFER = 3;

@Directive({selector: '[mdNodeDef]'})
export class MdNodeDef {
  constructor(public template: TemplateRef<any>,
              @Inject(forwardRef(() => MdTree)) private tree: MdTree) {
  }
}

@Directive({
  selector: 'md-node'
})
export class MdNode {
  constructor(
              private elementRef: ElementRef,
              private renderer: Renderer,
              @Inject(forwardRef(() => MdTree)) private tree: MdTree) {
    this.renderer.setElementClass(elementRef.nativeElement, 'mat-node', true);
  }
}

@Directive({selector: '[mdNodePlaceholder]'})
export class MdNodePlaceholder {
  constructor(public viewContainer: ViewContainerRef) { }
}

@Component({
  selector: 'md-tree',
  styleUrls: ['./tree.css'],
  template: `
    <ng-container mdNodePlaceholder></ng-container>
    <ng-template #emptyNode><div class="mat-placeholder"></div></ng-template>
  `,
  host: {
    'class': 'mat-tree',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdTree {
  @Input() dataSource: TreeDataSource<any>;
  @Input() expansionModel: SelectionModel<any> = new SelectionModel<any>(true, []);

  viewChange = new BehaviorSubject<MdTreeViewData>({start: 0, end: 20});

  // Tree structure related
  levelMap: Map<any, number> = new Map<any, number>();

  private _dataDiffer: IterableDiffer<any> = null;

  @ContentChildren(MdNodeDef) nodeDefinitions: QueryList<MdNodeDef>;
  @ViewChild(MdNodePlaceholder) nodePlaceholder: MdNodePlaceholder;
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
    const connectFn = this.dataSource.connectTree.bind(this.dataSource);
    Observable.combineLatest(this.viewChange.let(connectFn), this.expansionModel.onChange)
      .subscribe((result: any) => { this.renderNodeChanges(result[0]); });
    // Trigger first event
    this.expansionModel.onChange.next(null);
  }

  scrollToTop() {
    this.elementRef.nativeElement.scrollTop = 0;
  }

  scrollEvent() {
    console.log(`scroll event `);
    const scrollTop = this.elementRef.nativeElement.scrollTop;
    const elementHeight = this.elementRef.nativeElement.getBoundingClientRect().height;

    const topIndex = Math.floor(scrollTop / ROW_HEIGHT);

    const view = {
      start: Math.max(topIndex - BUFFER, 0),
      end: Math.ceil(topIndex + (elementHeight / ROW_HEIGHT)) + BUFFER
    };

    this.viewChange.next(view);
  }

  toggleExpand(node: any) {
    this.expansionModel.toggle(node);
  }

  renderNodeChanges(dataNodes: any[]) {
    console.time('Rendering rows');
    this.flattenNodes(dataNodes);
    dataNodes = this.flatNodes;

    const changes = this._dataDiffer.diff(dataNodes);
    if (!changes) { return; }

    const oldScrollTop = this.elementRef.nativeElement.scrollTop;
    changes.forEachOperation(
      (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
        if (item.previousIndex == null) {
          console.log('Adding row ');
          this.addNode(dataNodes[currentIndex], currentIndex);
        } else if (currentIndex == null) {
          console.log('Removing a row ');
          this.nodePlaceholder.viewContainer.remove(adjustedPreviousIndex);
        } else {
          console.log('Moving a row');
          const view = this.nodePlaceholder.viewContainer.get(adjustedPreviousIndex);
          this.nodePlaceholder.viewContainer.move(view, currentIndex);
        }
      });

    // Scroll changes in the process of adding/removing rows. Reset it back to where it was
    // so that it (1) it does not shift and (2) a scroll event does not get triggered which
    // would cause a loop.
    this.elementRef.nativeElement.scrollTop = oldScrollTop;
    this.changeDetectorRef.detectChanges();
    console.timeEnd('Rendering rows');
  }

  // Tree structure related
  flatNodes: any[];

  flattenNodes(dataNodes: any[]) {
    this.flatNodes = [];
    dataNodes.forEach((node) => {
      this._flattenNode(node, 1);
    })
  }

  _flattenNode(node: any, level: number) {
    let key = this.dataSource.getKey(node);
    this.levelMap.set(key, level);
    this.flatNodes.push(node);
    let children = this.dataSource.getChildren(node);
    if (!!children && this.expansionModel.isSelected(node)) {
      children.forEach((child) => this._flattenNode(child, level + 1));
    }
  }

  addNode(data: any, currentIndex: number) {
    if (data) {
      let node = this.getNodeDefForItem(data);
      const context = {
        $implicit: data,
        level: this.levelMap.get(this.dataSource.getKey(data)),
        expandable: !!this.dataSource.getChildren(data)
      };
      this.nodePlaceholder.viewContainer.createEmbeddedView(node.template, context, currentIndex);
    } else {
      this.nodePlaceholder.viewContainer.createEmbeddedView(this.emptyNodeTemplate, {}, currentIndex);
    }
  }

  getNodeDefForItem(item: any) {
    // proof-of-concept: only supporting one row definition
    return this.nodeDefinitions.first;
  }
}