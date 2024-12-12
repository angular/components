/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewContainerRef,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  InjectionToken,
  booleanAttribute,
  afterNextRender,
  AfterViewInit,
  inject,
  Injector,
  numberAttribute,
} from '@angular/core';
import {coerceElement, coerceNumberProperty} from '@angular/cdk/coercion';
import {BehaviorSubject, Observable, Observer, Subject, merge} from 'rxjs';
import {startWith, take, map, takeUntil, switchMap, tap} from 'rxjs/operators';
import type {
  CdkDragDrop,
  CdkDragEnd,
  CdkDragEnter,
  CdkDragExit,
  CdkDragMove,
  CdkDragStart,
  CdkDragRelease,
} from '../drag-events';
import {CDK_DRAG_HANDLE, CdkDragHandle} from './drag-handle';
import {CdkDragPlaceholder} from './drag-placeholder';
import {CdkDragPreview} from './drag-preview';
import {CDK_DRAG_PARENT} from '../drag-parent';
import {DragRef, Point, PreviewContainer} from '../drag-ref';
import type {CdkDropList} from './drop-list';
import {DragDrop} from '../drag-drop';
import {CDK_DRAG_CONFIG, DragDropConfig, DragStartDelay, DragAxis} from './config';
import {assertElementNode} from './assertions';
import {DragDropRegistry} from '../drag-drop-registry';

/**
 * Injection token that can be used to reference instances of `CdkDropList`. It serves as
 * alternative token to the actual `CdkDropList` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DROP_LIST = new InjectionToken<CdkDropList>('CdkDropList');

/** Element that can be moved inside a CdkDropList container. */
@Directive({
  selector: '[cdkDrag]',
  exportAs: 'cdkDrag',
  host: {
    'class': 'cdk-drag',
    '[class.cdk-drag-disabled]': 'disabled',
    '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
  },
  providers: [{provide: CDK_DRAG_PARENT, useExisting: CdkDrag}],
})
export class CdkDrag<T = any> implements AfterViewInit, OnChanges, OnDestroy {
  element = inject<ElementRef<HTMLElement>>(ElementRef);
  dropContainer = inject<CdkDropList>(CDK_DROP_LIST, {optional: true, skipSelf: true})!;
  private _ngZone = inject(NgZone);
  private _viewContainerRef = inject(ViewContainerRef);
  private _dir = inject(Directionality, {optional: true});
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _selfHandle = inject<CdkDragHandle>(CDK_DRAG_HANDLE, {optional: true, self: true});
  private _parentDrag = inject<CdkDrag>(CDK_DRAG_PARENT, {optional: true, skipSelf: true});
  private _dragDropRegistry = inject(DragDropRegistry);

  private readonly _destroyed = new Subject<void>();
  private _handles = new BehaviorSubject<CdkDragHandle[]>([]);
  private _previewTemplate: CdkDragPreview | null;
  private _placeholderTemplate: CdkDragPlaceholder | null;

  /** Reference to the underlying drag instance. */
  _dragRef: DragRef<CdkDrag<T>>;

  /** Arbitrary data to attach to this drag instance. */
  @Input('cdkDragData') data: T;

  /** Locks the position of the dragged element along the specified axis. */
  @Input('cdkDragLockAxis') lockAxis: DragAxis;

  /**
   * Selector that will be used to determine the root draggable element, starting from
   * the `cdkDrag` element and going up the DOM. Passing an alternate root element is useful
   * when trying to enable dragging on an element that you might not have access to.
   */
  @Input('cdkDragRootElement') rootElementSelector: string;

  /**
   * Node or selector that will be used to determine the element to which the draggable's
   * position will be constrained. If a string is passed in, it'll be used as a selector that
   * will be matched starting from the element's parent and going up the DOM until a match
   * has been found.
   */
  @Input('cdkDragBoundary') boundaryElement: string | ElementRef<HTMLElement> | HTMLElement;

  /**
   * Amount of milliseconds to wait after the user has put their
   * pointer down before starting to drag the element.
   */
  @Input('cdkDragStartDelay') dragStartDelay: DragStartDelay;

  /**
   * Sets the position of a `CdkDrag` that is outside of a drop container.
   * Can be used to restore the element's position for a returning user.
   */
  @Input('cdkDragFreeDragPosition') freeDragPosition: Point;

  /** Whether starting to drag this element is disabled. */
  @Input({alias: 'cdkDragDisabled', transform: booleanAttribute})
  get disabled(): boolean {
    return this._disabled || !!(this.dropContainer && this.dropContainer.disabled);
  }
  set disabled(value: boolean) {
    this._disabled = value;
    this._dragRef.disabled = this._disabled;
  }
  private _disabled: boolean;

  /**
   * Function that can be used to customize the logic of how the position of the drag item
   * is limited while it's being dragged. Gets called with a point containing the current position
   * of the user's pointer on the page, a reference to the item being dragged and its dimensions.
   * Should return a point describing where the item should be rendered.
   */
  @Input('cdkDragConstrainPosition') constrainPosition?: (
    userPointerPosition: Point,
    dragRef: DragRef,
    dimensions: DOMRect,
    pickupPositionInElement: Point,
  ) => Point;

  /** Class to be added to the preview element. */
  @Input('cdkDragPreviewClass') previewClass: string | string[];

  /**
   * Configures the place into which the preview of the item will be inserted. Can be configured
   * globally through `CDK_DROP_LIST`. Possible values:
   * - `global` - Preview will be inserted at the bottom of the `<body>`. The advantage is that
   * you don't have to worry about `overflow: hidden` or `z-index`, but the item won't retain
   * its inherited styles.
   * - `parent` - Preview will be inserted into the parent of the drag item. The advantage is that
   * inherited styles will be preserved, but it may be clipped by `overflow: hidden` or not be
   * visible due to `z-index`. Furthermore, the preview is going to have an effect over selectors
   * like `:nth-child` and some flexbox configurations.
   * - `ElementRef<HTMLElement> | HTMLElement` - Preview will be inserted into a specific element.
   * Same advantages and disadvantages as `parent`.
   */
  @Input('cdkDragPreviewContainer') previewContainer: PreviewContainer;

  /**
   * If the parent of the dragged element has a `scale` transform, it can throw off the
   * positioning when the user starts dragging. Use this input to notify the CDK of the scale.
   */
  @Input({alias: 'cdkDragScale', transform: numberAttribute})
  scale: number = 1;

  /** Emits when the user starts dragging the item. */
  @Output('cdkDragStarted') readonly started: EventEmitter<CdkDragStart> =
    new EventEmitter<CdkDragStart>();

  /** Emits when the user has released a drag item, before any animations have started. */
  @Output('cdkDragReleased') readonly released: EventEmitter<CdkDragRelease> =
    new EventEmitter<CdkDragRelease>();

  /** Emits when the user stops dragging an item in the container. */
  @Output('cdkDragEnded') readonly ended: EventEmitter<CdkDragEnd> = new EventEmitter<CdkDragEnd>();

  /** Emits when the user has moved the item into a new container. */
  @Output('cdkDragEntered') readonly entered: EventEmitter<CdkDragEnter<any>> = new EventEmitter<
    CdkDragEnter<any>
  >();

  /** Emits when the user removes the item its container by dragging it into another container. */
  @Output('cdkDragExited') readonly exited: EventEmitter<CdkDragExit<any>> = new EventEmitter<
    CdkDragExit<any>
  >();

  /** Emits when the user drops the item inside a container. */
  @Output('cdkDragDropped') readonly dropped: EventEmitter<CdkDragDrop<any>> = new EventEmitter<
    CdkDragDrop<any>
  >();

  /**
   * Emits as the user is dragging the item. Use with caution,
   * because this event will fire for every pixel that the user has dragged.
   */
  @Output('cdkDragMoved')
  readonly moved: Observable<CdkDragMove<T>> = new Observable(
    (observer: Observer<CdkDragMove<T>>) => {
      const subscription = this._dragRef.moved
        .pipe(
          map(movedEvent => ({
            source: this,
            pointerPosition: movedEvent.pointerPosition,
            event: movedEvent.event,
            delta: movedEvent.delta,
            distance: movedEvent.distance,
          })),
        )
        .subscribe(observer);

      return () => {
        subscription.unsubscribe();
      };
    },
  );

  private _injector = inject(Injector);

  constructor(...args: unknown[]);

  constructor() {
    const dropContainer = this.dropContainer;
    const config = inject<DragDropConfig>(CDK_DRAG_CONFIG, {optional: true});
    const dragDrop = inject(DragDrop);

    this._dragRef = dragDrop.createDrag(this.element, {
      dragStartThreshold:
        config && config.dragStartThreshold != null ? config.dragStartThreshold : 5,
      pointerDirectionChangeThreshold:
        config && config.pointerDirectionChangeThreshold != null
          ? config.pointerDirectionChangeThreshold
          : 5,
      zIndex: config?.zIndex,
    });
    this._dragRef.data = this;
    this._dragDropRegistry.registerDirectiveNode(this.element.nativeElement, this);

    if (config) {
      this._assignDefaults(config);
    }

    // Note that usually the container is assigned when the drop list is picks up the item, but in
    // some cases (mainly transplanted views with OnPush, see #18341) we may end up in a situation
    // where there are no items on the first change detection pass, but the items get picked up as
    // soon as the user triggers another pass by dragging. This is a problem, because the item would
    // have to switch from standalone mode to drag mode in the middle of the dragging sequence which
    // is too late since the two modes save different kinds of information. We work around it by
    // assigning the drop container both from here and the list.
    if (dropContainer) {
      this._dragRef._withDropContainer(dropContainer._dropListRef);
      dropContainer.addItem(this);

      // The drop container reads this so we need to sync it here.
      dropContainer._dropListRef.beforeStarted.pipe(takeUntil(this._destroyed)).subscribe(() => {
        this._dragRef.scale = this.scale;
      });
    }

    this._syncInputs(this._dragRef);
    this._handleEvents(this._dragRef);
  }

  /**
   * Returns the element that is being used as a placeholder
   * while the current element is being dragged.
   */
  getPlaceholderElement(): HTMLElement {
    return this._dragRef.getPlaceholderElement();
  }

  /** Returns the root draggable element. */
  getRootElement(): HTMLElement {
    return this._dragRef.getRootElement();
  }

  /** Resets a standalone drag item to its initial position. */
  reset(): void {
    this._dragRef.reset();
  }

  /**
   * Gets the pixel coordinates of the draggable outside of a drop container.
   */
  getFreeDragPosition(): Readonly<Point> {
    return this._dragRef.getFreeDragPosition();
  }

  /**
   * Sets the current position in pixels the draggable outside of a drop container.
   * @param value New position to be set.
   */
  setFreeDragPosition(value: Point): void {
    this._dragRef.setFreeDragPosition(value);
  }

  ngAfterViewInit() {
    // We need to wait until after render, in order for the reference
    // element to be in the proper place in the DOM. This is mostly relevant
    // for draggable elements inside portals since they get stamped out in
    // their original DOM position, and then they get transferred to the portal.
    afterNextRender(
      () => {
        this._updateRootElement();
        this._setupHandlesListener();
        this._dragRef.scale = this.scale;

        if (this.freeDragPosition) {
          this._dragRef.setFreeDragPosition(this.freeDragPosition);
        }
      },
      {injector: this._injector},
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    const rootSelectorChange = changes['rootElementSelector'];
    const positionChange = changes['freeDragPosition'];

    // We don't have to react to the first change since it's being
    // handled in the `afterNextRender` queued up in the constructor.
    if (rootSelectorChange && !rootSelectorChange.firstChange) {
      this._updateRootElement();
    }

    // Scale affects the free drag position so we need to sync it up here.
    this._dragRef.scale = this.scale;

    // Skip the first change since it's being handled in the `afterNextRender` queued up in the
    // constructor.
    if (positionChange && !positionChange.firstChange && this.freeDragPosition) {
      this._dragRef.setFreeDragPosition(this.freeDragPosition);
    }
  }

  ngOnDestroy() {
    if (this.dropContainer) {
      this.dropContainer.removeItem(this);
    }

    this._dragDropRegistry.removeDirectiveNode(this.element.nativeElement);

    // Unnecessary in most cases, but used to avoid extra change detections with `zone-paths-rxjs`.
    this._ngZone.runOutsideAngular(() => {
      this._handles.complete();
      this._destroyed.next();
      this._destroyed.complete();
      this._dragRef.dispose();
    });
  }

  _addHandle(handle: CdkDragHandle) {
    const handles = this._handles.getValue();
    handles.push(handle);
    this._handles.next(handles);
  }

  _removeHandle(handle: CdkDragHandle) {
    const handles = this._handles.getValue();
    const index = handles.indexOf(handle);

    if (index > -1) {
      handles.splice(index, 1);
      this._handles.next(handles);
    }
  }

  _setPreviewTemplate(preview: CdkDragPreview) {
    this._previewTemplate = preview;
  }

  _resetPreviewTemplate(preview: CdkDragPreview) {
    if (preview === this._previewTemplate) {
      this._previewTemplate = null;
    }
  }

  _setPlaceholderTemplate(placeholder: CdkDragPlaceholder) {
    this._placeholderTemplate = placeholder;
  }

  _resetPlaceholderTemplate(placeholder: CdkDragPlaceholder) {
    if (placeholder === this._placeholderTemplate) {
      this._placeholderTemplate = null;
    }
  }

  /** Syncs the root element with the `DragRef`. */
  private _updateRootElement() {
    const element = this.element.nativeElement as HTMLElement;
    let rootElement = element;
    if (this.rootElementSelector) {
      rootElement =
        element.closest !== undefined
          ? (element.closest(this.rootElementSelector) as HTMLElement)
          : // Comment tag doesn't have closest method, so use parent's one.
            (element.parentElement?.closest(this.rootElementSelector) as HTMLElement);
    }

    if (rootElement && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      assertElementNode(rootElement, 'cdkDrag');
    }

    this._dragRef.withRootElement(rootElement || element);
  }

  /** Gets the boundary element, based on the `boundaryElement` value. */
  private _getBoundaryElement() {
    const boundary = this.boundaryElement;

    if (!boundary) {
      return null;
    }

    if (typeof boundary === 'string') {
      return this.element.nativeElement.closest<HTMLElement>(boundary);
    }

    return coerceElement(boundary);
  }

  /** Syncs the inputs of the CdkDrag with the options of the underlying DragRef. */
  private _syncInputs(ref: DragRef<CdkDrag<T>>) {
    ref.beforeStarted.subscribe(() => {
      if (!ref.isDragging()) {
        const dir = this._dir;
        const dragStartDelay = this.dragStartDelay;
        const placeholder = this._placeholderTemplate
          ? {
              template: this._placeholderTemplate.templateRef,
              context: this._placeholderTemplate.data,
              viewContainer: this._viewContainerRef,
            }
          : null;
        const preview = this._previewTemplate
          ? {
              template: this._previewTemplate.templateRef,
              context: this._previewTemplate.data,
              matchSize: this._previewTemplate.matchSize,
              viewContainer: this._viewContainerRef,
            }
          : null;

        ref.disabled = this.disabled;
        ref.lockAxis = this.lockAxis;
        ref.scale = this.scale;
        ref.dragStartDelay =
          typeof dragStartDelay === 'object' && dragStartDelay
            ? dragStartDelay
            : coerceNumberProperty(dragStartDelay);
        ref.constrainPosition = this.constrainPosition;
        ref.previewClass = this.previewClass;
        ref
          .withBoundaryElement(this._getBoundaryElement())
          .withPlaceholderTemplate(placeholder)
          .withPreviewTemplate(preview)
          .withPreviewContainer(this.previewContainer || 'global');

        if (dir) {
          ref.withDirection(dir.value);
        }
      }
    });

    // This only needs to be resolved once.
    ref.beforeStarted.pipe(take(1)).subscribe(() => {
      // If we managed to resolve a parent through DI, use it.
      if (this._parentDrag) {
        ref.withParent(this._parentDrag._dragRef);
        return;
      }

      // Otherwise fall back to resolving the parent by looking up the DOM. This can happen if
      // the item was projected into another item by something like `ngTemplateOutlet`.
      let parent = this.element.nativeElement.parentElement;
      while (parent) {
        const parentDrag = this._dragDropRegistry.getDragDirectiveForNode(parent);
        if (parentDrag) {
          ref.withParent(parentDrag._dragRef);
          break;
        }
        parent = parent.parentElement;
      }
    });
  }

  /** Handles the events from the underlying `DragRef`. */
  private _handleEvents(ref: DragRef<CdkDrag<T>>) {
    ref.started.subscribe(startEvent => {
      this.started.emit({source: this, event: startEvent.event});

      // Since all of these events run outside of change detection,
      // we need to ensure that everything is marked correctly.
      this._changeDetectorRef.markForCheck();
    });

    ref.released.subscribe(releaseEvent => {
      this.released.emit({source: this, event: releaseEvent.event});
    });

    ref.ended.subscribe(endEvent => {
      this.ended.emit({
        source: this,
        distance: endEvent.distance,
        dropPoint: endEvent.dropPoint,
        event: endEvent.event,
      });

      // Since all of these events run outside of change detection,
      // we need to ensure that everything is marked correctly.
      this._changeDetectorRef.markForCheck();
    });

    ref.entered.subscribe(enterEvent => {
      this.entered.emit({
        container: enterEvent.container.data,
        item: this,
        currentIndex: enterEvent.currentIndex,
      });
    });

    ref.exited.subscribe(exitEvent => {
      this.exited.emit({
        container: exitEvent.container.data,
        item: this,
      });
    });

    ref.dropped.subscribe(dropEvent => {
      this.dropped.emit({
        previousIndex: dropEvent.previousIndex,
        currentIndex: dropEvent.currentIndex,
        previousContainer: dropEvent.previousContainer.data,
        container: dropEvent.container.data,
        isPointerOverContainer: dropEvent.isPointerOverContainer,
        item: this,
        distance: dropEvent.distance,
        dropPoint: dropEvent.dropPoint,
        event: dropEvent.event,
      });
    });
  }

  /** Assigns the default input values based on a provided config object. */
  private _assignDefaults(config: DragDropConfig) {
    const {
      lockAxis,
      dragStartDelay,
      constrainPosition,
      previewClass,
      boundaryElement,
      draggingDisabled,
      rootElementSelector,
      previewContainer,
    } = config;

    this.disabled = draggingDisabled == null ? false : draggingDisabled;
    this.dragStartDelay = dragStartDelay || 0;

    if (lockAxis) {
      this.lockAxis = lockAxis;
    }

    if (constrainPosition) {
      this.constrainPosition = constrainPosition;
    }

    if (previewClass) {
      this.previewClass = previewClass;
    }

    if (boundaryElement) {
      this.boundaryElement = boundaryElement;
    }

    if (rootElementSelector) {
      this.rootElementSelector = rootElementSelector;
    }

    if (previewContainer) {
      this.previewContainer = previewContainer;
    }
  }

  /** Sets up the listener that syncs the handles with the drag ref. */
  private _setupHandlesListener() {
    // Listen for any newly-added handles.
    this._handles
      .pipe(
        // Sync the new handles with the DragRef.
        tap(handles => {
          const handleElements = handles.map(handle => handle.element);

          // Usually handles are only allowed to be a descendant of the drag element, but if
          // the consumer defined a different drag root, we should allow the drag element
          // itself to be a handle too.
          if (this._selfHandle && this.rootElementSelector) {
            handleElements.push(this.element);
          }

          this._dragRef.withHandles(handleElements);
        }),
        // Listen if the state of any of the handles changes.
        switchMap((handles: CdkDragHandle[]) => {
          return merge(
            ...handles.map(item => item._stateChanges.pipe(startWith(item))),
          ) as Observable<CdkDragHandle>;
        }),
        takeUntil(this._destroyed),
      )
      .subscribe(handleInstance => {
        // Enabled/disable the handle that changed in the DragRef.
        const dragRef = this._dragRef;
        const handle = handleInstance.element.nativeElement;
        handleInstance.disabled ? dragRef.disableHandle(handle) : dragRef.enableHandle(handle);
      });
  }
}
