import {AfterViewInit, Component, signal, viewChild} from '@angular/core';
import {CdkScrollable} from '@angular/cdk/scrolling';

/** @title Reacting to scroll events */
@Component({
  selector: 'cdk-scrollable-overview-example',
  templateUrl: 'cdk-scrollable-overview-example.html',
  styleUrl: 'cdk-scrollable-overview-example.css',
  imports: [CdkScrollable],
})
export class CdkScrollableOverviewExample implements AfterViewInit {
  scrollable = viewChild.required(CdkScrollable);
  items = Array.from({length: 50}).map((_, i) => `Item #${i}`);
  scrollOffset = signal(0);

  ngAfterViewInit() {
    const scrollable = this.scrollable();

    // Scroll events are emitted outside of the Angular zone. Updating a signal
    // lets Angular know that the view needs to be refreshed.
    scrollable.elementScrolled().subscribe(() => {
      this.scrollOffset.set(Math.round(scrollable.measureScrollOffset('top')));
    });
  }

  scrollToTop() {
    this.scrollable().scrollTo({top: 0});
  }
}
