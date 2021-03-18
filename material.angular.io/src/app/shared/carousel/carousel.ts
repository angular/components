import {
  AfterContentInit,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  QueryList,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {FocusableOption, FocusKeyManager} from '@angular/cdk/a11y';


@Directive({
  selector: '[carousel-item]',
})
export class CarouselItem implements FocusableOption {
  @HostBinding('attr.role') readonly role = 'listitem';
  @HostBinding('style.width.px') width = this.carousel.itemWidth;
  @HostBinding('tabindex') tabindex = '-1';

  constructor(readonly carousel: Carousel, readonly element: ElementRef) {
  }

  focus(): void {
    this.element.nativeElement.focus({preventScroll: true});
  }
}

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.html',
  styleUrls: ['./carousel.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Carousel implements AfterContentInit {
  @Input('aria-label') ariaLabel: string | undefined;
  @Input() itemWidth: number | undefined;
  @ContentChildren(CarouselItem) items!: QueryList<CarouselItem>;
  @ViewChild('contentWrapper') wrapper!: ElementRef;
  position = 0;
  showPrevArrow = false;
  showNextArrow = true;
  visibleItems: number | undefined;
  shiftWidth: number | undefined;
  itemsArray: CarouselItem[] | undefined;
  private focusKeyManager: FocusKeyManager<CarouselItem> | undefined;

  constructor(private readonly element: ElementRef) {}

  private _index = 0;

  get index(): number {
    return this._index;
  }

  set index(i: number) {
    this._index = i;
    let lastVisibleIndex = this.items.length;
    if (this.visibleItems) {
      lastVisibleIndex -= this.visibleItems;
    }

    this.showPrevArrow = i > 0;
    this.showNextArrow = i < lastVisibleIndex;
  }

  onKeydown(event: KeyboardEvent) {
    if (this.focusKeyManager != null) {
      switch (event.key) {
        case 'Tab':
          if (!this.focusKeyManager.activeItem) {
            this.focusKeyManager.setFirstItemActive();
            this._updateItemTabIndices();
          }
          break;

        case 'ArrowLeft':
          if (this.focusKeyManager.activeItemIndex === this.index) {
            this.previous();
          }
          this.focusKeyManager.setPreviousItemActive();
          this._updateItemTabIndices();
          break;

        case 'ArrowRight':
          if (this.focusKeyManager.activeItemIndex === this.index + (this.visibleItems || 0) - 1) {
            this.next();
          }
          this.focusKeyManager.setNextItemActive();
          this._updateItemTabIndices();
          break;

        default:
          break;
      }
    }
  }

  onResize() {
    this._resizeCarousel();
  }

  ngAfterContentInit(): void {
    this.focusKeyManager =
      new FocusKeyManager<CarouselItem>(this.items) as FocusKeyManager<CarouselItem>;
    // timeout to make sure clientWidth is defined
    setTimeout(() => {
      this.itemsArray = this.items.toArray();
      this.shiftWidth = this.calculateShiftWidth(this.itemsArray);
      this._resizeCarousel();
    });
  }

  next() {
    // prevent keyboard navigation from going out of bounds
    if (this.showNextArrow) {
      this._shiftItems(1);
    }
  }

  previous() {
    // prevent keyboard navigation from going out of bounds
    if (this.showPrevArrow) {
      this._shiftItems(-1);
    }
  }

  /**
   * @param items array of carousel items
   * @return width to shift the carousel
   */
  calculateShiftWidth(items: CarouselItem[]): number {
    return items[0].element.nativeElement.clientWidth;
  }

  private _updateItemTabIndices() {
    this.items.forEach((item: CarouselItem) => {
      if (this.focusKeyManager != null) {
        item.tabindex = item === this.focusKeyManager.activeItem ? '0' : '-1';
      }
    });
  }

  private _shiftItems(shiftIndex: number) {
    this.index += shiftIndex;
    this.position += shiftIndex *
      (this.shiftWidth || this.calculateShiftWidth(this.items.toArray()));
    this.items.forEach((item: CarouselItem) => {
      item.element.nativeElement.style.transform = `translateX(-${this.position}px)`;
    });
  }

  private _resizeCarousel() {
    if (this.shiftWidth == null) {
      this.shiftWidth = this.calculateShiftWidth(this.items.toArray());
    }
    const newVisibleItems = Math.max(1, Math.min(
      Math.floor((this.element.nativeElement.offsetWidth) / this.shiftWidth),
      this.items.length));
    if (this.visibleItems !== newVisibleItems) {
      if ((this.visibleItems || 0) < newVisibleItems) {
        const lastVisibleIndex = this.items.length - (this.visibleItems || 0);
        const shiftIndex = this.index - (lastVisibleIndex) + 1;
        if (shiftIndex > 0) {
          this._shiftItems(-shiftIndex);
        }
      } else {
        if (this.focusKeyManager != null) {
          if (this.focusKeyManager.activeItemIndex && this.focusKeyManager.activeItemIndex >
            this.index + newVisibleItems - 1) {
            this.focusKeyManager.setPreviousItemActive();
            this._updateItemTabIndices();
          }
        }
      }
      this.visibleItems = newVisibleItems;
      this.showNextArrow = this.index < (this.items.length - this.visibleItems);
    }
    this.wrapper.nativeElement.style.width = `${this.visibleItems * this.shiftWidth}px`;
  }
}
