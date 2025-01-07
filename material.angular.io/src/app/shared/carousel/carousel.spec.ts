import {Component, ViewChild} from '@angular/core';
import {waitForAsync, ComponentFixture, fakeAsync, flush, TestBed} from '@angular/core/testing';
import {DocsAppTestingModule} from '../../testing/testing-module';
import {Carousel, CarouselItem} from './carousel';


describe('HorizontalCarousel', () => {
  let fixture: ComponentFixture<CarouselTestComponent>;
  let component: Carousel;


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DocsAppTestingModule, CarouselTestComponent],
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(CarouselTestComponent);
    fixture.nativeElement.style.width = '1300px';
    fixture.detectChanges();
    flush();
    component = fixture.componentInstance.carousel;
  }));

  it('should not show prev nav arrow when instantiated', () => {
    const navPrevious = fixture.nativeElement.querySelector('.docs-carousel-nav-prev');
    expect(navPrevious).toBeNull();

    const navNext = fixture.nativeElement.querySelector('.docs-carousel-nav-next');
    expect(navNext).toBeDefined();
  });

  it('should show prev nav arrow after increasing index', () => {
    component.next();
    fixture.detectChanges();

    const navPrevious = fixture.nativeElement.querySelector('.docs-carousel-nav-prev');
    expect(navPrevious).toBeDefined();
  });

  it('should hide next nav arrow after reaching end of items', () => {
    component.next();
    component.next();
    fixture.detectChanges();

    const navPrevious = fixture.nativeElement.querySelector('.docs-carousel-nav-next');
    expect(navPrevious).toBeNull();
  });
});

@Component({
  selector: 'test-carousel',
  template: `
    <app-carousel>
      @for (i of items; track i) {
        <div carousel-item class="docs-carousel-item-container"></div>
      }
    </app-carousel>`,
  styles: [`
    .docs-carousel-item-container {
      display: flex;
      width: 250px;
    }
  `],
  standalone: true,
  imports: [Carousel, CarouselItem, DocsAppTestingModule]
})
class CarouselTestComponent {
  @ViewChild(Carousel) carousel!: Carousel;
  items: number[] = [];

  constructor() {
    for (let i = 0; i < 6; i++) {
      this.items.push(i);
    }
  }
}
