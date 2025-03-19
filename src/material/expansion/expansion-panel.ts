/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkAccordionItem} from '@angular/cdk/accordion';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {CdkPortalOutlet, TemplatePortal} from '@angular/cdk/portal';
import {DOCUMENT} from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  NgZone,
  Renderer2,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {Subject} from 'rxjs';
import {filter, startWith, take} from 'rxjs/operators';
import {MatAccordionBase, MatAccordionTogglePosition, MAT_ACCORDION} from './accordion-base';
import {MAT_EXPANSION_PANEL} from './expansion-panel-base';
import {MatExpansionPanelContent} from './expansion-panel-content';
import {_animationsDisabled} from '../core';

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
  providers: [
    // Provide MatAccordion as undefined to prevent nested expansion panels from registering
    // to the same accordion.
    {provide: MAT_ACCORDION, useValue: undefined},
    {provide: MAT_EXPANSION_PANEL, useExisting: MatExpansionPanel},
  ],
  host: {
    'class': 'mat-expansion-panel',
    '[class.mat-expanded]': 'expanded',
    '[class.mat-expansion-panel-spacing]': '_hasSpacing()',
  },
  imports: [CdkPortalOutlet],
})
export class MatExpansionPanel
  extends CdkAccordionItem
  implements AfterContentInit, OnChanges, OnDestroy
{
  private _viewContainerRef = inject(ViewContainerRef);
  private readonly _animationsDisabled = _animationsDisabled();
  private _document = inject(DOCUMENT);
  private _ngZone = inject(NgZone);
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _renderer = inject(Renderer2);
  private _cleanupTransitionEnd: (() => void) | undefined;

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
  override accordion = inject<MatAccordionBase>(MAT_ACCORDION, {optional: true, skipSelf: true})!;

  /** Content that will be rendered lazily. */
  @ContentChild(MatExpansionPanelContent) _lazyContent: MatExpansionPanelContent;

  /** Element containing the panel's user-provided content. */
  @ViewChild('body') _body: ElementRef<HTMLElement>;

  /** Element wrapping the panel body. */
  @ViewChild('bodyWrapper')
  protected _bodyWrapper: ElementRef<HTMLElement> | undefined;

  /** Portal holding the user's content. */
  _portal: TemplatePortal;

  /** ID for the associated header element. Used for a11y labelling. */
  _headerId: string = inject(_IdGenerator).getId('mat-expansion-panel-header-');

  constructor(...args: unknown[]);

  constructor() {
    super();

    const defaultOptions = inject<MatExpansionPanelDefaultOptions>(
      MAT_EXPANSION_PANEL_DEFAULT_OPTIONS,
      {optional: true},
    );

    this._expansionDispatcher = inject(UniqueSelectionDispatcher);

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

    this._setupAnimationEvents();
  }

  ngOnChanges(changes: SimpleChanges) {
    this._inputChanges.next(changes);
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._cleanupTransitionEnd?.();
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

  private _transitionEndListener = ({target, propertyName}: TransitionEvent) => {
    if (target === this._bodyWrapper?.nativeElement && propertyName === 'grid-template-rows') {
      this._ngZone.run(() => {
        if (this.expanded) {
          this.afterExpand.emit();
        } else {
          this.afterCollapse.emit();
        }
      });
    }
  };

  protected _setupAnimationEvents() {
    // This method is defined separately, because we need to
    // disable this logic in some internal components.
    this._ngZone.runOutsideAngular(() => {
      if (this._animationsDisabled) {
        this.opened.subscribe(() => this._ngZone.run(() => this.afterExpand.emit()));
        this.closed.subscribe(() => this._ngZone.run(() => this.afterCollapse.emit()));
      } else {
        setTimeout(() => {
          const element = this._elementRef.nativeElement;
          this._cleanupTransitionEnd = this._renderer.listen(
            element,
            'transitionend',
            this._transitionEndListener,
          );
          element.classList.add('mat-expansion-panel-animations-enabled');
        }, 200);
      }
    });
  }
}

/**
 * Actions of a `<mat-expansion-panel>`.
 */
@Directive({
  selector: 'mat-action-row',
  host: {
    class: 'mat-action-row',
  },
})
export class MatExpansionPanelActionRow {}
