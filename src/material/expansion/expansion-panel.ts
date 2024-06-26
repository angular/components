/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEvent} from '@angular/animations';
import {CdkAccordionItem} from '@angular/cdk/accordion';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {CdkPortalOutlet, TemplatePortal} from '@angular/cdk/portal';
import {DOCUMENT} from '@angular/common';
import {
  AfterContentInit,
  ANIMATION_MODULE_TYPE,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  SimpleChanges,
  SkipSelf,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {Subject} from 'rxjs';
import {filter, startWith, take} from 'rxjs/operators';
import {MAT_ACCORDION, MatAccordionBase, MatAccordionTogglePosition} from './accordion-base';
import {matExpansionAnimations} from './expansion-animations';
import {MAT_EXPANSION_PANEL} from './expansion-panel-base';
import {MatExpansionPanelContent} from './expansion-panel-content';

/** MatExpansionPanel's states. */
export type MatExpansionPanelState = 'expanded' | 'collapsed';

/**
 * Object that can be used to override the default options
 * for all of the expansion panels in a module.
 */
export interface MatExpansionPanelDefaultOptions {
  /** Height of the header while the panel is expanded. */
  expandedHeight: string;

  /** Height of the header while the panel is collapsed. */
  collapsedHeight: string;

  /** Whether the toggle indicator should be hidden. */
  hideToggle: boolean;
}

/**
 * Injection token that can be used to configure the default
 * options for the expansion panel component.
 */
export const MAT_EXPANSION_PANEL_DEFAULT_OPTIONS =
  new InjectionToken<MatExpansionPanelDefaultOptions>('MAT_EXPANSION_PANEL_DEFAULT_OPTIONS');

/**
 * This component can be used as a single element to show expandable content, or as one of
 * multiple children of an element with the MatAccordion directive attached.
 */
@Component({
  styleUrl: 'expansion-panel.css',
  selector: 'mat-expansion-panel',
  exportAs: 'matExpansionPanel',
  templateUrl: 'expansion-panel.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [matExpansionAnimations.bodyExpansion],
  providers: [
    // Provide MatAccordion as undefined to prevent nested expansion panels from registering
    // to the same accordion.
    {provide: MAT_ACCORDION, useValue: undefined},
    {provide: MAT_EXPANSION_PANEL, useExisting: MatExpansionPanel},
  ],
  host: {
    'class': 'mat-expansion-panel',
    '[class.mat-expanded]': 'expanded',
    '[class._mat-animation-noopable]': '_animationsDisabled',
    '[class.mat-expansion-panel-spacing]': '_hasSpacing()',
  },
  standalone: true,
  imports: [CdkPortalOutlet],
})
export class MatExpansionPanel
  extends CdkAccordionItem
  implements AfterContentInit, OnChanges, OnDestroy
{
  protected _animationsDisabled: boolean;
  private _document: Document;

  /** Whether the toggle indicator should be hidden. */
  @Input({transform: booleanAttribute})
  get hideToggle(): boolean {
    return this._hideToggle || (this.accordion && this.accordion.hideToggle);
  }
  set hideToggle(value: boolean) {
    this._hideToggle = value;
  }
  private _hideToggle = false;

  /** The position of the expansion indicator. */
  @Input()
  get togglePosition(): MatAccordionTogglePosition {
    return this._togglePosition || (this.accordion && this.accordion.togglePosition);
  }
  set togglePosition(value: MatAccordionTogglePosition) {
    this._togglePosition = value;
  }
  private _togglePosition: MatAccordionTogglePosition;

  /** An event emitted after the body's expansion animation happens. */
  @Output() readonly afterExpand = new EventEmitter<void>();

  /** An event emitted after the body's collapse animation happens. */
  @Output() readonly afterCollapse = new EventEmitter<void>();

  /** Stream that emits for changes in `@Input` properties. */
  readonly _inputChanges = new Subject<SimpleChanges>();

  /** Optionally defined accordion the expansion panel belongs to. */
  override accordion: MatAccordionBase;

  /** Content that will be rendered lazily. */
  @ContentChild(MatExpansionPanelContent) _lazyContent: MatExpansionPanelContent;

  /** Element containing the panel's user-provided content. */
  @ViewChild('body') _body: ElementRef<HTMLElement>;

  /** Portal holding the user's content. */
  _portal: TemplatePortal;

  /** ID for the associated header element. Used for a11y labelling. */
  _headerId = this._idGenerator.getId('mat-expansion-panel-header-');

  constructor(
    @Optional() @SkipSelf() @Inject(MAT_ACCORDION) accordion: MatAccordionBase,
    _changeDetectorRef: ChangeDetectorRef,
    _uniqueSelectionDispatcher: UniqueSelectionDispatcher,
    private _viewContainerRef: ViewContainerRef,
    @Inject(DOCUMENT) _document: any,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode: string,
    @Inject(MAT_EXPANSION_PANEL_DEFAULT_OPTIONS)
    @Optional()
    defaultOptions?: MatExpansionPanelDefaultOptions,
  ) {
    super(accordion, _changeDetectorRef, _uniqueSelectionDispatcher);
    this.accordion = accordion;
    this._document = _document;
    this._animationsDisabled = _animationMode === 'NoopAnimations';

    if (defaultOptions) {
      this.hideToggle = defaultOptions.hideToggle;
    }
  }

  /** Determines whether the expansion panel should have spacing between it and its siblings. */
  _hasSpacing(): boolean {
    if (this.accordion) {
      return this.expanded && this.accordion.displayMode === 'default';
    }
    return false;
  }

  /** Gets the expanded state string. */
  _getExpandedState(): MatExpansionPanelState {
    return this.expanded ? 'expanded' : 'collapsed';
  }

  /** Toggles the expanded state of the expansion panel. */
  override toggle(): void {
    this.expanded = !this.expanded;
  }

  /** Sets the expanded state of the expansion panel to false. */
  override close(): void {
    this.expanded = false;
  }

  /** Sets the expanded state of the expansion panel to true. */
  override open(): void {
    this.expanded = true;
  }

  ngAfterContentInit() {
    if (this._lazyContent && this._lazyContent._expansionPanel === this) {
      // Render the content as soon as the panel becomes open.
      this.opened
        .pipe(
          startWith(null),
          filter(() => this.expanded && !this._portal),
          take(1),
        )
        .subscribe(() => {
          this._portal = new TemplatePortal(this._lazyContent._template, this._viewContainerRef);
        });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this._inputChanges.next(changes);
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._inputChanges.complete();
  }

  /** Checks whether the expansion panel's content contains the currently-focused element. */
  _containsFocus(): boolean {
    if (this._body) {
      const focusedElement = this._document.activeElement;
      const bodyElement = this._body.nativeElement;
      return focusedElement === bodyElement || bodyElement.contains(focusedElement);
    }

    return false;
  }

  /** Called when the expansion animation has started. */
  protected _animationStarted(event: AnimationEvent) {
    if (!isInitialAnimation(event) && !this._animationsDisabled && this._body) {
      // Prevent the user from tabbing into the content while it's animating.
      // TODO(crisbeto): maybe use `inert` to prevent focus from entering while closed as well
      // instead of `visibility`? Will allow us to clean up some code but needs more testing.
      this._body?.nativeElement.setAttribute('inert', '');
    }
  }

  /** Called when the expansion animation has finished. */
  protected _animationDone(event: AnimationEvent) {
    if (!isInitialAnimation(event)) {
      if (event.toState === 'expanded') {
        this.afterExpand.emit();
      } else if (event.toState === 'collapsed') {
        this.afterCollapse.emit();
      }

      // Re-enable tabbing once the animation is finished.
      if (!this._animationsDisabled && this._body) {
        this._body.nativeElement.removeAttribute('inert');
      }
    }
  }
}

/** Checks whether an animation is the initial setup animation. */
function isInitialAnimation(event: AnimationEvent): boolean {
  return event.fromState === 'void';
}

/**
 * Actions of a `<mat-expansion-panel>`.
 */
@Directive({
  selector: 'mat-action-row',
  host: {
    class: 'mat-action-row',
  },
  standalone: true,
})
export class MatExpansionPanelActionRow {}
