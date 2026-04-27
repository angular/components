import {SortedCollection} from './collection';
import {HasElement} from './element';
import {
  signal,
  Component,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  InjectionToken,
  afterNextRender,
  Input,
} from '@angular/core';
import {waitForMicrotasks} from '../testing/test-helpers';

const TEST_COLLECTION = new InjectionToken<SortedCollection<TestItemComponent>>('TEST_COLLECTION');
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

describe('SortedCollection with real directives', () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;
  let collectionDirective: TestCollectionComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [],
    });

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;

    fixture.detectChanges();
    await waitForMicrotasks();

    const collectionEl = fixture.debugElement.query(By.directive(TestCollectionComponent));
    collectionDirective = collectionEl.injector.get(TestCollectionComponent);
  });

  afterEach(() => {
    collectionDirective._collection.stopObserving();
  });

  it('should register items initially', () => {
    const orderedItems = collectionDirective._collection.orderedItems();
    expect(orderedItems.length).toBe(3);
    expect(orderedItems[0].value).toBe('A');
    expect(orderedItems[2].value).toBe('C');
  });

  it('should unregister items when removed from DOM', async () => {
    testComponent.items.set(['A', 'C']);
    fixture.detectChanges();
    await waitForMicrotasks();

    const orderedItems = collectionDirective._collection.orderedItems();
    expect(orderedItems.length).toBe(2);
    expect(orderedItems[0].value).toBe('A');
    expect(orderedItems[1].value).toBe('C');
  });

  it('should maintain initial collection order before shuffling', () => {
    const orderedItems = collectionDirective._collection.orderedItems();

    expect(orderedItems.length).toBe(3);
    expect(orderedItems[0].value).toBe('A');
    expect(orderedItems[2].value).toBe('C');
  });

  it('should update collection order when items are shuffled', async () => {
    testComponent.items.set(['C', 'B', 'A']);
    fixture.detectChanges();
    await waitForMicrotasks();

    const orderedItems = collectionDirective._collection.orderedItems();

    expect(orderedItems.length).toBe(3);
    expect(orderedItems[0].value).toBe('C');
    expect(orderedItems[2].value).toBe('A');
  });
});

@Component({
  selector: 'testCollection',
  providers: [
    {provide: TEST_COLLECTION, useFactory: () => inject(TestCollectionComponent)._collection},
  ],
  template: '<ng-content />',
})
class TestCollectionComponent implements HasElement, OnDestroy {
  readonly _collection = new SortedCollection<TestItemComponent>();
  readonly element = inject(ElementRef).nativeElement as HTMLElement;

  constructor() {
    afterNextRender(() => {
      this._collection.startObserving(this.element);
    });
  }

  ngOnDestroy() {
    this._collection.stopObserving();
  }
}

@Component({
  selector: 'testItem',
  template: `
    <div>{{value}}</div>
  `,
})
class TestItemComponent implements HasElement, OnInit, OnDestroy {
  readonly element = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _collection = inject(TEST_COLLECTION);

  @Input() value!: string;

  constructor() {
    afterNextRender(() => {
      this._collection.register(this);
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this._collection.unregister(this);
  }
}

@Component({
  template: `
    <testCollection>
      @for (item of items(); track item) {
        <testItem [value]="item" />
      }
    </testCollection>
  `,
  imports: [TestCollectionComponent, TestItemComponent],
})
class TestComponent {
  readonly items = signal(['A', 'B', 'C']);
}
