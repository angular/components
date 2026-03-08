import {CdkVirtualScrollViewport, ScrollingModule} from '../scrolling';
import {Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import {dispatchFakeEvent} from '../testing/private';

describe('CdkVirtualScrollViewport with CdkDynamicSizeVirtualScrollStrategy', () => {
  let fixture: ComponentFixture<DynamicSizeVirtualScroll>;
  let testComponent: DynamicSizeVirtualScroll;
  let viewport: CdkVirtualScrollViewport;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ScrollingModule, DynamicSizeVirtualScroll],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicSizeVirtualScroll);
    testComponent = fixture.componentInstance;
    viewport = testComponent.viewport;
  });

  const VIRTUAL_SCROLL_ORIENTATIONS = ['vertical', 'horizontal'];

  VIRTUAL_SCROLL_ORIENTATIONS.forEach(orientation => {
    describe(`${orientation} orientation`, () => {
      describe('same sizes', () => {
        const baseConfig = {
          viewport: '600',
          orientation: orientation,
          sizes: ['200', '200', '200', '200', '200', '200'],
          minBuffer: '100',
          maxBuffer: '200',
          scrollOffset: '0',
          disableAppending: true,
        } as DynamicSizeSpecProperties;

        describe('no scroll offset - just was rendered', () => {
          const config = {
            ...baseConfig,
          } as DynamicSizeSpecProperties;

          it('maxBuffer: 200', fakeAsync(() => {
            expect(setupAndGetRenderedRange(config, fixture, testComponent, viewport)).toEqual({
              start: 0,
              end: 4,
              itemsIds: ['0', '1', '2', '3'],
            });
          }));

          it('maxBuffer: 400', fakeAsync(() => {
            expect(
              setupAndGetRenderedRange(
                {
                  ...config,
                  maxBuffer: '400',
                },
                fixture,
                testComponent,
                viewport,
              ),
            ).toEqual({
              start: 0,
              end: 5,
              itemsIds: ['0', '1', '2', '3', '4'],
            });
          }));
        });

        describe('offset: 100px - a bit scrolled from the start', () => {
          const config = {
            ...baseConfig,
            scrollOffset: '100',
          } as DynamicSizeSpecProperties;

          it('maxBuffer: 200', fakeAsync(() => {
            expect(setupAndGetRenderedRange(config, fixture, testComponent, viewport)).toEqual({
              start: 0,
              end: 4,
              itemsIds: ['0', '1', '2', '3'],
            });
          }));

          it('maxBuffer: 200 & minBuffer: 101', fakeAsync(() => {
            expect(
              setupAndGetRenderedRange(
                {
                  ...config,
                  minBuffer: '101',
                },
                fixture,
                testComponent,
                viewport,
              ),
            ).toEqual({
              start: 0,
              end: 5,
              itemsIds: ['0', '1', '2', '3', '4'],
            });
          }));

          it('maxBuffer: 200 & minBuffer: 101 & 8 items', fakeAsync(() => {
            expect(
              setupAndGetRenderedRange(
                {
                  ...config,
                  sizes: ['200', '200', '200', '200', '200', '200', '200', '200'],
                  minBuffer: '101',
                  maxBuffer: '400',
                },
                fixture,
                testComponent,
                viewport,
              ),
            ).toEqual({
              start: 0,
              end: 5,
              itemsIds: ['0', '1', '2', '3', '4'],
            });
          }));

          it('maxBuffer: 400', fakeAsync(() => {
            expect(
              setupAndGetRenderedRange(
                {
                  ...config,
                  maxBuffer: '400',
                },
                fixture,
                testComponent,
                viewport,
              ),
            ).toEqual({
              start: 0,
              end: 5,
              itemsIds: ['0', '1', '2', '3', '4'],
            });
          }));

          it('maxBuffer: 400 & minBuffer: 101', fakeAsync(() => {
            expect(
              setupAndGetRenderedRange(
                {
                  ...config,
                  minBuffer: '101',
                  maxBuffer: '400',
                },
                fixture,
                testComponent,
                viewport,
              ),
            ).toEqual({
              start: 0,
              end: 5,
              itemsIds: ['0', '1', '2', '3', '4'],
            });
          }));

          it('maxBuffer: 400 & minBuffer: 101 & 8 items', fakeAsync(() => {
            expect(
              setupAndGetRenderedRange(
                {
                  ...config,
                  sizes: ['200', '200', '200', '200', '200', '200', '200', '200'],
                  minBuffer: '101',
                  maxBuffer: '400',
                },
                fixture,
                testComponent,
                viewport,
              ),
            ).toEqual({
              start: 0,
              end: 5,
              itemsIds: ['0', '1', '2', '3', '4'],
            });
          }));
        });

        describe('offset: 600px - in the middle of list', () => {
          const config = {
            ...baseConfig,
            sizes: ['200', '200', '200', '200', '200', '200', '200', '200', '200'],
            scrollOffset: '600',
          } as DynamicSizeSpecProperties;

          it('minBuffer: 100 & maxBuffer: 200', fakeAsync(() => {
            expect(setupAndGetRenderedRange(config, fixture, testComponent, viewport)).toEqual({
              start: 1,
              end: 7,
              // since we have offset: 600px and first three in total have also 600px, the "start" becomes firstVisibleIndex - 1 = 1
              itemsIds: ['1', '2', '3', '4', '5', '6'],
            });
          }));

          it('offset: 601px, minBuffer: 100, maxBuffer: 200', fakeAsync(() => {
            expect(
              setupAndGetRenderedRange(
                {
                  ...config,
                  scrollOffset: '601',
                },
                fixture,
                testComponent,
                viewport,
              ),
            ).toEqual({
              start: 2,
              end: 8,
              itemsIds: ['2', '3', '4', '5', '6', '7'],
            });
          }));
        });

        describe('offset: 1200px - at the end of list', () => {
          const config = {
            ...baseConfig,
            sizes: ['200', '200', '200', '200', '200', '200', '200', '200', '200'],
            scrollOffset: '1200',
          } as DynamicSizeSpecProperties;

          it('maxBuffer: 200', fakeAsync(() => {
            expect(setupAndGetRenderedRange(config, fixture, testComponent, viewport)).toEqual({
              start: 4,
              end: 9,
              itemsIds: ['4', '5', '6', '7', '8'],
            });
          }));

          it('maxBuffer: 400', fakeAsync(() => {
            expect(
              setupAndGetRenderedRange(
                {...config, maxBuffer: '400'},
                fixture,
                testComponent,
                viewport,
              ),
            ).toEqual({
              start: 3,
              end: 9,
              itemsIds: ['3', '4', '5', '6', '7', '8'],
            });
          }));
        });
      });

      describe('sizes changes', () => {
        const baseConfig = {
          viewport: '600',
          orientation: orientation,
          sizes: [
            {id: '0', size: '200'},
            {id: '1', size: '200'},
            {id: '2', size: '200'},
            {id: '3', size: '200'},
            {id: '4', size: '200'},
          ],
          minBuffer: '100',
          maxBuffer: '200',
          scrollOffset: '0',
          disableAppending: true,
        } as DynamicSizeSpecProperties;

        it('item got bigger than viewport', fakeAsync(() => {
          setupAndGetRenderedRange(baseConfig, fixture, testComponent, viewport);

          expect(getRenderedRange(fixture, viewport)).toEqual({
            start: 0,
            end: 4,
            itemsIds: ['0', '1', '2', '3'],
          });

          fixture.componentInstance.sizes = [
            {id: '0', size: '200'},
            {id: '1', size: '400'},
            {id: '2', size: '200'},
            {id: '3', size: '200'},
            {id: '4', size: '200'},
          ];

          triggerViewport(fixture, viewport);
          // at this point we do not remove item '3', that is how algorithm is implemented
          // todo: research - should we remove that items? #2890
          expect(getRenderedRange(fixture, viewport)).toEqual({
            start: 0,
            end: 4,
            itemsIds: ['0', '1', '2', '3'],
          });
        }));

        it('item size was bigger than viewport and become 1/3 of viewport', fakeAsync(() => {
          const config = {
            ...baseConfig,
            sizes: [
              {id: '0', size: '200'},
              {id: '1', size: '400'},
              {id: '2', size: '200'},
              {id: '3', size: '200'},
              {id: '4', size: '200'},
            ],
          } as DynamicSizeSpecProperties;
          setupAndGetRenderedRange(config, fixture, testComponent, viewport);

          expect(getRenderedRange(fixture, viewport)).toEqual({
            start: 0,
            end: 3,
            itemsIds: ['0', '1', '2'],
          });

          fixture.componentInstance.sizes = [
            {id: '0', size: '200'},
            {id: '1', size: '200'},
            {id: '2', size: '200'},
            {id: '3', size: '200'},
            {id: '4', size: '200'},
          ];

          triggerViewport(fixture, viewport);

          expect(getRenderedRange(fixture, viewport)).toEqual({
            start: 0,
            end: 4,
            itemsIds: ['0', '1', '2', '3'],
          });
        }));

        it('item size was changed outside the viewport', fakeAsync(() => {
          setupAndGetRenderedRange(baseConfig, fixture, testComponent, viewport);

          expect(getRenderedRange(fixture, viewport)).toEqual({
            start: 0,
            end: 4,
            itemsIds: ['0', '1', '2', '3'],
          });

          fixture.componentInstance.sizes = [
            {id: '0', size: '200'},
            {id: '1', size: '200'},
            {id: '2', size: '200'},
            {id: '3', size: '400'}, // this is changed from 200 to 400
            {id: '4', size: '200'},
          ];

          triggerViewport(fixture, viewport);
          expect(getRenderedRange(fixture, viewport)).toEqual({
            start: 0,
            end: 4,
            itemsIds: ['0', '1', '2', '3'],
          });
        }));

        it('item before the viewport got bigger', fakeAsync(() => {
          const config = {
            ...baseConfig,
            scrollOffset: '600',
            sizes: [
              {id: '0', size: '200'},
              {id: '1', size: '200'},
              {id: '2', size: '200'},
              {id: '3', size: '200'},
              {id: '4', size: '200'},
              {id: '5', size: '200'},
            ],
          } as DynamicSizeSpecProperties;
          const range = setupAndGetRenderedRange(config, fixture, testComponent, viewport);

          const expectedRange = {
            start: 1,
            end: 6,
            itemsIds: ['1', '2', '3', '4', '5'],
          };

          expect(range).toEqual(expectedRange);

          fixture.componentInstance.sizes = [
            {id: '0', size: '200'},
            {id: '1', size: '200'},
            {id: '2', size: '600'},
            {id: '3', size: '200'},
            {id: '4', size: '200'},
            {id: '5', size: '200'},
          ];

          triggerViewport(fixture, viewport);

          expect(getRenderedRange(fixture, viewport)).toEqual(expectedRange);
        }));

        it('item before the viewport got smaller', fakeAsync(() => {
          if (orientation === 'vertical') return;

          const config = {
            ...baseConfig,
            scrollOffset: '600',
            sizes: [
              {id: '0', size: '200'},
              {id: '1', size: '200'},
              {id: '2', size: '600'},
              {id: '3', size: '200'},
              {id: '4', size: '200'},
              {id: '5', size: '200'},
            ],
          } as DynamicSizeSpecProperties;
          const range = setupAndGetRenderedRange(config, fixture, testComponent, viewport);

          const expectedRange = {
            start: 1,
            end: 5,
            itemsIds: ['1', '2', '3', '4'],
          };

          expect(range).toEqual(expectedRange);

          fixture.componentInstance.sizes = [
            {id: '0', size: '200'},
            {id: '1', size: '200'},
            {id: '2', size: '200'},
            {id: '3', size: '200'},
            {id: '4', size: '200'},
            {id: '5', size: '200'},
          ];

          triggerViewport(fixture, viewport);

          expect(getRenderedRange(fixture, viewport)).toEqual({
            start: 1,
            end: 6,
            itemsIds: ['1', '2', '3', '4', '5'],
          });
        }));
      });

      it('items less than viewport', fakeAsync(() => {
        const config = {
          viewport: '600',
          orientation: orientation,
          sizes: ['200', '200', '200'],
          minBuffer: '100',
          maxBuffer: '200',
          scrollOffset: '0',
          disableAppending: true,
        } as DynamicSizeSpecProperties;

        expect(setupAndGetRenderedRange(config, fixture, testComponent, viewport)).toEqual({
          start: 0,
          end: 3,
          itemsIds: ['0', '1', '2'],
        });
      }));

      describe('disable appending: false', () => {
        it('renderedRange should contain previously rendered items', fakeAsync(() => {
          const config = {
            viewport: '600',
            orientation: orientation,
            sizes: ['200', '200', '200', '200', '200', '200', '200', '200', '200'],
            minBuffer: '100',
            maxBuffer: '200',
            scrollOffset: '1200',
            disableAppending: false,
          } as DynamicSizeSpecProperties;
          const rendered = setupAndGetRenderedRange(config, fixture, testComponent, viewport);
          expect(rendered.start).toEqual(0);
          expect(rendered.end).toEqual(9);

          triggerScroll(viewport, 0);

          const renderedAfterScrollMove = getRenderedRange(fixture, viewport);
          expect(renderedAfterScrollMove.start).toEqual(0);
          expect(renderedAfterScrollMove.end).toEqual(9);
        }));

        it('renderedRange should contain items when they are removed and added', fakeAsync(() => {
          const config = {
            viewport: '600',
            orientation: orientation,
            sizes: [
              {id: '0', size: '200'},
              {id: '1', size: '200'},
              {id: '2', size: '200'},
              {id: '3', size: '200'},
              {id: '4', size: '200'},
              {id: '5', size: '200'},
              {id: '6', size: '200'},
              {id: '7', size: '200'},
              {id: '8', size: '200'},
            ],
            minBuffer: '100',
            maxBuffer: '200',
            scrollOffset: '1200',
            disableAppending: false,
          } as DynamicSizeSpecProperties;
          const rendered = setupAndGetRenderedRange(config, fixture, testComponent, viewport);
          expect(rendered.start).toEqual(0);
          expect(rendered.end).toEqual(9);

          fixture.componentInstance.sizes = [
            {id: '0', size: '200'},
            {id: '1', size: '200'},
            {id: '2', size: '200'},
            {id: '3', size: '200'},
            {id: '5', size: '200'},
            {id: '6', size: '200'},
            {id: '7', size: '200'},
            {id: '8', size: '200'},
          ]; // removed 1

          triggerViewport(fixture, viewport);

          const rendered1 = getRenderedRange(fixture, viewport);
          expect(rendered1.start).toEqual(0);
          expect(rendered1.end).toEqual(8);

          fixture.componentInstance.sizes = [
            {id: '0', size: '200'},
            {id: '1', size: '200'},
            {id: '2', size: '200'},
            {id: '3', size: '200'},
            {id: '5', size: '200'},
            {id: '6', size: '200'},
            {id: '7', size: '200'},
            {id: '8', size: '200'},
            {id: '9', size: '200'},
          ]; // added 1

          triggerViewport(fixture, viewport);

          const rendered2 = getRenderedRange(fixture, viewport);
          expect(rendered2.start).toEqual(3);
          expect(rendered2.end).toEqual(9);
        }));
      });

      describe('some items in list are removed', () => {
        const baseConfig = {
          viewport: '600',
          orientation: orientation,
          sizes: ['200', '200', '200', '200', '200', '200'],
          minBuffer: '100',
          maxBuffer: '200',
          scrollOffset: '0',
          disableAppending: true,
        } as DynamicSizeSpecProperties;

        describe('offset: start of the list, remove items so they are less than viewport', () => {
          it('less than viewport', fakeAsync(() => {
            setupAndGetRenderedRange(baseConfig, fixture, testComponent, viewport);
            fixture.componentInstance.sizes = ['200', '200'];

            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();
            flush();

            expect(getRenderedRange(fixture, viewport)).toEqual({
              start: 0,
              end: 2,
              itemsIds: ['0', '1'],
            });
          }));

          it('removed buffered item after viewport', fakeAsync(() => {
            setupAndGetRenderedRange(
              {
                ...baseConfig,
                sizes: [
                  {id: '0', size: '200'},
                  {id: '1', size: '200'},
                  {id: '2', size: '200'},
                  {id: '3', size: '200'},
                  {id: '4', size: '200'},
                  {id: '5', size: '200'},
                ],
              },
              fixture,
              testComponent,
              viewport,
            );

            fixture.componentInstance.sizes = [
              {id: '0', size: '200'},
              {id: '1', size: '200'},
              {id: '2', size: '200'},
              {id: '4', size: '200'},
              {id: '5', size: '200'},
            ];

            triggerViewport(fixture, viewport);

            expect(getRenderedRange(fixture, viewport)).toEqual({
              start: 0,
              end: 4,
              itemsIds: ['0', '1', '2', '4'],
            });
          }));
        });

        describe('offset: in the middle of the list, middles items are removed', () => {
          const config = {
            ...baseConfig,
            scrollOffset: '600',
            sizes: [
              {id: '0', size: '200'},
              {id: '1', size: '200'},
              {id: '2', size: '200'},
              {id: '3', size: '200'},
              {id: '4', size: '200'},
              {id: '5', size: '200'},
              {id: '6', size: '200'},
              {id: '7', size: '200'},
              {id: '8', size: '200'},
            ],
          };

          it('less than viewport, before 9 items, after removal 7 items', fakeAsync(() => {
            setupAndGetRenderedRange(config, fixture, testComponent, viewport);
            fixture.componentInstance.sizes = [
              {id: '0', size: '200'},
              {id: '1', size: '200'},
              {id: '2', size: '200'},
              {id: '3', size: '200'},
              {id: '6', size: '200'},
              {id: '7', size: '200'},
              {id: '8', size: '200'},
            ];

            triggerViewport(fixture, viewport);

            expect(getRenderedRange(fixture, viewport)).toEqual({
              start: 1,
              end: 7,
              itemsIds: ['1', '2', '3', '6', '7', '8'],
            });
          }));

          it('removed buffered two items after viewport from left and right sides', fakeAsync(() => {
            if (orientation === 'vertical') return;

            setupAndGetRenderedRange(config, fixture, testComponent, viewport);
            fixture.componentInstance.sizes = [
              {id: '0', size: '200'},
              {id: '1', size: '200'}, // 2 was removed
              {id: '3', size: '200'},
              {id: '4', size: '200'},
              {id: '5', size: '200'}, // 6 was removed
              {id: '7', size: '200'},
              {id: '8', size: '200'},
            ];

            triggerViewport(fixture, viewport);

            expect(getRenderedRange(fixture, viewport)).toEqual({
              start: 1,
              end: 7,
              itemsIds: ['1', '3', '4', '5', '7', '8'],
            });
          }));
        });

        describe('offset: end of the list, last items are removed', () => {
          it('less than viewport, before 6 items, after removal 5 items', fakeAsync(() => {
            if (orientation === 'vertical') return;

            setupAndGetRenderedRange(
              {...baseConfig, scrollOffset: '600'},
              fixture,
              testComponent,
              viewport,
            );
            fixture.componentInstance.sizes = ['200', '200', '200', '200', '200'];

            triggerViewport(fixture, viewport);

            expect(getRenderedRange(fixture, viewport)).toEqual({
              start: 1,
              end: 5,
              itemsIds: ['1', '2', '3', '4'],
            });
          }));

          it('removed buffered two items after viewport from left and right sides', fakeAsync(() => {
            const sizes = [
              {id: '0', size: '200'},
              {id: '1', size: '200'},
              {id: '2', size: '200'},
              {id: '3', size: '200'},
              {id: '4', size: '200'},
              {id: '5', size: '200'},
              {id: '6', size: '200'},
              {id: '7', size: '200'},
              {id: '8', size: '200'},
            ];

            setupAndGetRenderedRange(
              {...baseConfig, sizes: sizes, scrollOffset: '1200'},
              fixture,
              testComponent,
              viewport,
            );
            fixture.componentInstance.sizes = [
              {id: '0', size: '200'},
              {id: '1', size: '200'},
              {id: '2', size: '200'},
              {id: '3', size: '200'},
              {id: '4', size: '200'},
              {id: '6', size: '200'}, // 5 was removed
              {id: '7', size: '200'},
              {id: '8', size: '200'},
            ];

            triggerViewport(fixture, viewport);

            expect(getRenderedRange(fixture, viewport)).toEqual({
              start: 4,
              end: 8,
              itemsIds: ['4', '6', '7', '8'],
            });
          }));
        });
      });

      describe('different sizes', () => {
        const config = {
          viewport: '600',
          orientation: orientation,
          sizes: ['200', '400', '200', '400', '100', '100'],
          minBuffer: '100',
          maxBuffer: '200',
          scrollOffset: '0',
          disableAppending: true,
        } as DynamicSizeSpecProperties;

        it('maxBuffer: 200', fakeAsync(() => {
          expect(setupAndGetRenderedRange(config, fixture, testComponent, viewport)).toEqual({
            start: 0,
            end: 3,
            itemsIds: ['0', '1', '2'],
          });
        }));

        it('maxBuffer: 400', fakeAsync(() => {
          expect(
            setupAndGetRenderedRange(
              {
                ...config,
                maxBuffer: '400',
              },
              fixture,
              testComponent,
              viewport,
            ),
          ).toEqual({
            start: 0,
            end: 4,
            itemsIds: ['0', '1', '2', '3'],
          });
        }));
      });
    });
    // #2890
    // describe('two directional virtual scroll', () => {});
    // describe('table of virtual scrolls (one direction)', () => {});
    // describe('renderedRange specs')', () => {});
  });
});

/** Finish initializing the virtual scroll component at the beginning of a test. */
function finishInit(fixture: ComponentFixture<any>) {
  // On the first cycle we render and measure the viewport.
  fixture.detectChanges();
  flush();

  // On the second cycle we render the items.
  fixture.detectChanges();
  flush();

  // Flush the initial fake scroll event.
  tick(16); // flush animation frame
  flush();
  fixture.detectChanges();
}

function triggerViewport(
  fixture: ComponentFixture<DynamicSizeVirtualScroll>,
  viewport: CdkVirtualScrollViewport,
) {
  fixture.changeDetectorRef.markForCheck();
  fixture.detectChanges();
  flush();
  triggerScroll(viewport);
  fixture.detectChanges();
  flush();
}

/** Trigger a scroll event on the viewport (optionally setting a new scroll offset). */
function triggerScroll(viewport: CdkVirtualScrollViewport, offset?: number) {
  if (offset !== undefined) {
    viewport.scrollToOffset(offset);
  }
  dispatchFakeEvent(viewport.scrollable!.getElementRef().nativeElement, 'scroll');
  tick(16); // flush animation frame
}

type DynamicSizeObjectSize = {id: string; size: string};
type DynamicSizeSizes = string[] | DynamicSizeObjectSize[];

interface DynamicSizeSpecProperties {
  viewport: string;
  orientation: 'horizontal' | 'vertical';
  sizes: DynamicSizeSizes;
  minBuffer: string;
  maxBuffer: string;
  scrollOffset: string;
  disableAppending: boolean;
}

interface DynamicSizeRenderedRangeResult {
  start: number;
  end: number;
  itemsIds: string[];
}

function setupAndGetRenderedRange(
  properties: DynamicSizeSpecProperties,
  fixture: ComponentFixture<DynamicSizeVirtualScroll>,
  testComponent: DynamicSizeVirtualScroll,
  viewport: CdkVirtualScrollViewport,
): DynamicSizeRenderedRangeResult {
  testComponent.viewportSize = Number(properties.viewport);
  testComponent.orientation = properties.orientation;
  testComponent.sizes = properties.sizes.slice();
  testComponent.minBufferPx = Number(properties.minBuffer);
  testComponent.maxBufferPx = Number(properties.maxBuffer);
  testComponent.disableAppending = properties.disableAppending;

  finishInit(fixture);
  triggerScroll(viewport, Number(properties.scrollOffset));
  fixture.detectChanges();
  flush();

  const renderedRange = viewport.getRenderedRange();
  const renderedItems: Element[] = Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll('.item[data-id]'),
  );
  const itemsIds = renderedItems.map(item => item.getAttribute('data-id') ?? '');
  return {
    start: renderedRange.start,
    end: renderedRange.end,
    itemsIds,
  };
}

function getRenderedRange(
  fixture: ComponentFixture<DynamicSizeVirtualScroll>,
  viewport: CdkVirtualScrollViewport,
) {
  const renderedRange = viewport.getRenderedRange();
  const renderedItems: Element[] = Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll('.item[data-id]'),
  );
  const itemsIds = renderedItems.map(item => item.getAttribute('data-id') ?? '');
  return {
    start: renderedRange.start,
    end: renderedRange.end,
    itemsIds,
  };
}

@Component({
  template: `
    <cdk-virtual-scroll-viewport
        dynamicSize
        [sizes]="numericSizes"
        [minBufferPx]="minBufferPx"
        [maxBufferPx]="maxBufferPx"
        [disableAppending]="disableAppending"
        [stretch]="stretch"
        [orientation]="orientation"
        [style.height.px]="viewportHeight"
        [style.width.px]="viewportWidth">
      <div
          class="item"
          *cdkVirtualFor="let size of sizes; let i = index; trackBy: trackBySize"
          [attr.data-id]="getDataId(size, i)"
          [style.height.px]="orientation == 'vertical' ? getSize(size) : 50"
          [style.width.px]="orientation == 'horizontal' ? getSize(size) : 50">
        {{getSize(size)}} {{i}}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: `
    .cdk-virtual-scroll-content-wrapper {
      display: flex;
      flex-direction: column;
    }

    cdk-virtual-scroll-viewport {
      border: 1px solid black;
    }

    .item {
      outline: 1px solid gray;
    }

    .cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper {
      flex-direction: row;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  imports: [ScrollingModule],
})
class DynamicSizeVirtualScroll {
  @ViewChild(CdkVirtualScrollViewport, {static: true}) viewport: CdkVirtualScrollViewport;

  orientation: 'vertical' | 'horizontal' = 'vertical';
  viewportSize = 100;
  viewportCrossSize = 100;
  sizes: DynamicSizeSizes = ['20', '40', '60', '80', '100', '120'];
  minBufferPx = 0;
  maxBufferPx = 0;
  disableAppending = true;
  stretch = false;

  get numericSizes(): number[] {
    return this.sizes.map(size => this.getSize(size));
  }

  get viewportWidth() {
    return this.orientation == 'horizontal' ? this.viewportSize : this.viewportCrossSize;
  }

  get viewportHeight() {
    return this.orientation == 'horizontal' ? this.viewportCrossSize : this.viewportSize;
  }

  getDataId(size: string | DynamicSizeObjectSize, idx: number): string {
    return typeof size === 'string' ? String(idx) : size.id;
  }

  trackBySize(index: number, size: string | DynamicSizeObjectSize): string | number {
    return typeof size === 'string' ? index : size.id;
  }

  getSize(size: string | DynamicSizeObjectSize): number {
    return Number(typeof size === 'string' ? size : size.size);
  }
}
