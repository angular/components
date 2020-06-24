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


@Directive({
  selector: '[carousel-item]',
})
export class CarouselItem {
  @HostBinding('style.width.px') width = this.carousel.itemWidth;
  @HostBinding('tabindex') tabindex = '-1';

  constructor(readonly carousel: Carousel, readonly element: ElementRef) {
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

  onResize() {
    this._resizeCarousel();
  }

  ngAfterContentInit(): void {
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
      this._updateItemTabIndices();
    }
  }

  previous() {
    // prevent keyboard navigation from going out of bounds
    if (this.showPrevArrow) {
      this._shiftItems(-1);
      this._updateItemTabIndices();
    }
  }

  private _updateItemTabIndices() {
    for (let i = 0; i < this.items.length; i++) {
      this.itemsArray[i].tabindex =
        (i >= this.index && i < this.index + this.visibleItems) ? '0' : '-1';
    }
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
      }
      this.visibleItems = newVisibleItems;
      this.showNextArrow = this.index < (this.items.length - this.visibleItems);
      this._updateItemTabIndices();
    }
    this.wrapper.nativeElement.style.width = `${this.visibleItems * this.shiftWidth}px`;
  }
}

