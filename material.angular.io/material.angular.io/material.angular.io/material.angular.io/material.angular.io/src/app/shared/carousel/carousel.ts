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
  @Input('aria-label') ariaLabel: string;
  @Input() itemWidth: number;
  @ContentChildren(CarouselItem) items: QueryList<CarouselItem>;
  @ViewChild('contentWrapper') wrapper: ElementRef;
  position = 0;
  showPrevArrow = false;
  showNextArrow = true;
  visibleItems: number;
  shiftWidth: number;
  itemsArray: CarouselItem[];
  private focusKeyManager: FocusKeyManager<CarouselItem>;

  constructor(private readonly element: ElementRef) {
  }

  private _index = 0;

  get index(): number {
    return this._index;
  }

  set index(i: number) {
    this._index = i;
    this.showPrevArrow = i > 0;
    this.showNextArrow = i < (this.items.length - this.visibleItems);
  }

  onKeydown(event: KeyboardEvent) {
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
        if (this.focusKeyManager.activeItemIndex === this.index + this.visibleItems - 1) {
          this.next();
        }
        this.focusKeyManager.setNextItemActive();
        this._updateItemTabIndices();
        break;

      default:
        break;
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
      this.shiftWidth = this.items.first.element.nativeElement.clientWidth;
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

  private _updateItemTabIndices() {
    this.items.forEach((item: CarouselItem) => {
      item.tabindex = item === this.focusKeyManager.activeItem ? '0' : '-1';
    });
  }

  private _shiftItems(shiftIndex: number) {
    this.index += shiftIndex;
    this.position += shiftIndex * this.shiftWidth;
    this.items.forEach((item: CarouselItem) => {
      item.element.nativeElement.style.transform = `translateX(-${this.position}px)`;
    });
  }

  private _resizeCarousel() {
    const newVisibleItems = Math.max(1, Math.min(
      Math.floor((this.element.nativeElement.offsetWidth) / this.shiftWidth),
      this.items.length));
    if (this.visibleItems !== newVisibleItems) {
      if (this.visibleItems < newVisibleItems) {
        const shiftIndex = this.index - (this.items.length - this.visibleItems) + 1;
        if (shiftIndex > 0) {
          this._shiftItems(-shiftIndex);
        }
      } else {
        if (this.focusKeyManager.activeItemIndex && this.focusKeyManager.activeItemIndex >
          this.index + newVisibleItems - 1) {
          this.focusKeyManager.setPreviousItemActive();
          this._updateItemTabIndices();
        }
      }
      this.visibleItems = newVisibleItems;
      this.showNextArrow = this.index < (this.items.length - this.visibleItems);
    }
    this.wrapper.nativeElement.style.width = `${this.visibleItems * this.shiftWidth}px`;
  }
}

