// TODO(kara): prevent-close functionality

import {
  AfterContentInit,
  Attribute,
  Component,
  ContentChildren,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {PopoverPositionX, PopoverPositionY} from './popover-positions';
import {MdPopoverInvalidPositionX, MdPopoverInvalidPositionY} from './popover-errors';
//import {FocusKeyManager} from '@angular/material/core/a11y/focus-key-manager';
import {MdPopoverPanel} from './popover-panel';
import {Subscription} from 'rxjs/Subscription';
import {transformPopover, fadeInItems} from './popover-animations';

@Component({
  moduleId: module.id,
  selector: 'md-popover, mat-popover',
  host: {'role': 'dialog'},
  templateUrl: 'popover.html',
  styleUrls: ['popover.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    transformPopover,
    fadeInItems
  ],
  exportAs: 'mdPopover'
})
export class MdPopover implements AfterContentInit, MdPopoverPanel, OnDestroy {
  //private _keyManager: FocusKeyManager;

  /** Subscription to tab events on the popover panel */
  private _tabSubscription: Subscription;

  /** Config object to be passed into the popover's ngClass */
  _classList: any = {};

  /** Position of the popover in the X axis. */
  positionX: PopoverPositionX = 'after';

  /** Position of the popover in the Y axis. */
  positionY: PopoverPositionY = 'below';

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
  //@ContentChildren(MdPopoverItem) items: QueryList<MdPopoverItem>;
  @Input() overlapTrigger = true;

  /** @NEW Custom Start */

  closeDisabled = false;

  /** Popover Trigger event */
  @Input() mdPopoverTrigger = 'hover';

  /** Popover placement */
  @Input() mdPopoverPlacement = 'bottom';

  /** Popover delay */
  @Input() mdPopoverDelay = 300;


  @HostListener('mouseover') onMouseOver() {
    if (this.mdPopoverTrigger == 'hover') {
      this.closeDisabled = true;
      console.log('mouseover: md-popover');
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.mdPopoverTrigger == 'hover') {
      this.closeDisabled = false;
      this.close.emit();
      console.log('mouseleave: md-popover');
    }
  }

  /** @NEW Custom End */

  constructor(@Attribute('x-position') posX: PopoverPositionX,
              @Attribute('y-position') posY: PopoverPositionY) {
    if (posX) { this._setPositionX(posX); }
    if (posY) { this._setPositionY(posY); }
    this.setPositionClasses(this.positionX, this.positionY);
  }

  ngAfterContentInit() {
    //this._keyManager = new FocusKeyManager(this.items).withWrap();
    //this._tabSubscription = this._keyManager.tabOut.subscribe(() => {
      //this._emitCloseEvent();
    //});
  }

  ngOnDestroy() {
    this._tabSubscription.unsubscribe();
  }

  /**
   * This method takes classes set on the host md-popover element and applies them on the
   * popover template that displays in the overlay container.  Otherwise, it's difficult
   * to style the containing popover from outside the component.
   * @param classes list of class names
   */
  @Input('class')
  set classList(classes: string) {
    this._classList = classes.split(' ').reduce((obj: any, className: string) => {
      obj[className] = true;
      return obj;
    }, {});
    this.setPositionClasses(this.positionX, this.positionY);
  }

  /** Event emitted when the popover is closed. */
  @Output() close = new EventEmitter<void>();

  /**
   * Focus the first item in the popover. This method is used by the popover trigger
   * to focus the first item when the popover is opened by the ENTER key.
   */
  focusFirstItem() {
    //this._keyManager.setFirstItemActive();
  }

  /**
   * This emits a close event to which the trigger is subscribed. When emitted, the
   * trigger will close the popover.
   */
  _emitCloseEvent(): void {
    this.close.emit();
  }

  private _setPositionX(pos: PopoverPositionX): void {
    if ( pos !== 'before' && pos !== 'after') {
      throw new MdPopoverInvalidPositionX();
    }
    this.positionX = pos;
  }

  private _setPositionY(pos: PopoverPositionY): void {
    if ( pos !== 'above' && pos !== 'below') {
      throw new MdPopoverInvalidPositionY();
    }
    this.positionY = pos;
  }

  /**
   * It's necessary to set position-based classes to ensure the popover panel animation
   * folds out from the correct direction.
   */
  setPositionClasses(posX: PopoverPositionX, posY: PopoverPositionY): void {
    this._classList['md-popover-before'] = posX == 'before';
    this._classList['md-popover-after'] = posX == 'after';
    this._classList['md-popover-above'] = posY == 'above';
    this._classList['md-popover-below'] = posY == 'below';
  }

}
