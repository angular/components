import {
  ViewChild,
  Component,
  Directive,
  TemplateRef,
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

/** Height of each row in pixels (48 + 1px border) */
export const ROW_HEIGHT = 49;

/** Amount of rows to buffer around the view */
export const BUFFER = 3;

@Directive({selector: '[mdNodeDef]'})
export class MdNodeDef {
  @Input('mdNodeDef') name: string;

  constructor(public template: TemplateRef<any>) {}
}

@Component({
  selector: 'md-node',
  template: '<ng-container mdNodeOutlet></ng-container>',
  host: {
    'class': 'mat-row',
    'role': 'row',
  },
})
export class MdNode {
  constructor(private nodeDef: MdNodeDef,
              private elementRef: ElementRef,
              private renderer: Renderer) {
    this.renderer.setElementClass(elementRef.nativeElement, 'mat-node', true);
    this.renderer.setElementClass(elementRef.nativeElement, nodeDef.name, true);
  }
}

@Directive({selector: '[mdNodeOutlet]'})
export class MdNodeOutlet {
  node: MdNodeDef;
  context: any;

  static mostRecentNodeOutlet: MdNodeOutlet = null;

  constructor(private _viewContainer: ViewContainerRef) {
    MdNodeOutlet.mostRecentNodeOutlet = this;
  }

  ngOnInit() {
    this._viewContainer.createEmbeddedView(this.node.template, this.context);
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
    <ng-template #emptyNode><div class="empty"></div></ng-template>
  `,
  host: {
    'class': 'mat-tree',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MdTree {
  @Input() dataSource: TreeDataSource<any>;

  viewChange = new BehaviorSubject<MdTreeViewData>({start: 0, end: 20});

  private _dataDiffer: IterableDiffer<any> = null;

  @ContentChildren(MdNodeDef) nodeDefinitions: QueryList<MdNodeDef>;
  @ViewChild(MdNodePlaceholder) nodePlaceholder: MdNodePlaceholder;
  @ViewChild('emptyNode') emptyNodeTemplate: TemplateRef<any>;

  constructor(private _differs: IterableDiffers, private elementRef: ElementRef) {
    this._dataDiffer = this._differs.find([]).create();
  }

  ngOnInit() {
    Observable.fromEvent(this.elementRef.nativeElement, 'scroll')
      .debounceTime(100)
      .subscribe(() => this.scrollEvent());
  }

  ngAfterViewInit() {
    const connectFn = this.dataSource.connectTree.bind(this.dataSource);
    this.viewChange.let(connectFn)
      .subscribe((result: any) => { this.renderNodeChanges(result); });
  }

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

    this.viewChange.next(view);
  }

  renderNodeChanges(dataNodes: any[]) {

    console.time('Rendering rows');
    console.log(dataNodes);
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

    console.timeEnd('Rendering rows');
  }

  addNode(data: any, currentIndex: number) {
    if (data) {
      let node = this.getRowDefForItem(data);

      const context = {$implicit: data};
      this.nodePlaceholder.viewContainer.createEmbeddedView(node.template, context, currentIndex);

      // Set cells outlet
      this.setLatestRowsCellsOutlet(node, data);
    } else {
      this.nodePlaceholder.viewContainer.createEmbeddedView(this.emptyNodeTemplate, {}, currentIndex);
    }
  }

  // Hack attack! Because we're so smart, we know that immediately after calling
  // `createEmbeddedView` that the most recently constructed instance of MdCellOutlet
  // is the one inside this row, so we can set stuff to it (so that the user doesn't have to).
  // TODO: add some code to enforce that exactly one MdCellOutlet was instantiated as a result
  // of this `createEmbeddedView`.
  setLatestRowsCellsOutlet(node: MdNodeDef, item: any) {
    let nodeOutlet = MdNodeOutlet.mostRecentNodeOutlet;
    nodeOutlet.node = node;
    nodeOutlet.context = {$implicit: item};
  }

  getRowDefForItem(item: any) {
    // proof-of-concept: only supporting one row definition
    return this.nodeDefinitions.first;
  }
}