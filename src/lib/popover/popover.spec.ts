import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  MdPopoverModule,
  MdPopoverTrigger,
  MdPopoverPanel,
  PopoverPositionX,
  PopoverPositionY
} from './popover';
import {OverlayContainer} from '@angular/material/core/overlay/overlay-container';
import {ViewportRuler} from '@angular/material/core/overlay/position/viewport-ruler';
import {Dir, LayoutDirection} from '@angular/material/core/rtl/dir';
import {extendObject} from '@angular/material/core/util/object-extend';

describe('MdPopover', () => {
  let overlayContainerElement: HTMLElement;
  let dir: LayoutDirection;

  beforeEach(async(() => {
    dir = 'ltr';
    TestBed.configureTestingModule({
      imports: [MdPopoverModule.forRoot()],
      declarations: [SimplePopover, PositionedPopover, OverlapPopover, CustomPopoverPanel, CustomPopover],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          overlayContainerElement.style.position = 'fixed';
          overlayContainerElement.style.top = '0';
          overlayContainerElement.style.left = '0';
          document.body.appendChild(overlayContainerElement);

          // remove body padding to keep consistent cross-browser
          document.body.style.padding = '0';
          document.body.style.margin = '0';
          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Dir, useFactory: () => {
          return {value: dir};
        }},
        {provide: ViewportRuler, useClass: FakeViewportRuler}
      ]
    });

    TestBed.compileComponents();
  }));

  afterEach(() => {
    document.body.removeChild(overlayContainerElement);
  });

  it('should open the popover as an idempotent operation', () => {
    const fixture = TestBed.createComponent(SimplePopover);
    fixture.detectChanges();
    expect(overlayContainerElement.textContent).toBe('');
    expect(() => {
      fixture.componentInstance.trigger.openPopover();
      fixture.componentInstance.trigger.openPopover();

      expect(overlayContainerElement.textContent).toContain('Item');
      expect(overlayContainerElement.textContent).toContain('Disabled');
    }).not.toThrowError();
  });

  it('should close the popover when a click occurs outside the popover', async(() => {
    const fixture = TestBed.createComponent(SimplePopover);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openPopover();

    const backdrop = <HTMLElement>overlayContainerElement.querySelector('.cdk-overlay-backdrop');
    backdrop.click();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(overlayContainerElement.textContent).toBe('');
    });
  }));

  it('should open a custom popover', () => {
    const fixture = TestBed.createComponent(CustomPopover);
    fixture.detectChanges();
    expect(overlayContainerElement.textContent).toBe('');
    expect(() => {
      fixture.componentInstance.trigger.openPopover();
      fixture.componentInstance.trigger.openPopover();

      expect(overlayContainerElement.textContent).toContain('Custom Popover header');
      expect(overlayContainerElement.textContent).toContain('Custom Content');
    }).not.toThrowError();
  });

  it('should set the panel direction based on the trigger direction', () => {
    dir = 'rtl';
    const fixture = TestBed.createComponent(SimplePopover);
    fixture.detectChanges();
    fixture.componentInstance.trigger.openPopover();
    fixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane');
    expect(overlayPane.getAttribute('dir')).toEqual('rtl');
  });

  describe('positions', () => {

    beforeEach(() => {
      const fixture = TestBed.createComponent(PositionedPopover);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the bottom edge of viewport,so it has space to open "above"
      trigger.style.position = 'relative';
      trigger.style.top = '600px';

      // Push trigger to the right, so it has space to open "before"
      trigger.style.left = '100px';

      fixture.componentInstance.trigger.openPopover();
      fixture.detectChanges();
    });

    it('should append md-popover-before if x position is changed', () => {
      const panel = overlayContainerElement.querySelector('.md-popover-panel');
      expect(panel.classList).toContain('md-popover-before');
      expect(panel.classList).not.toContain('md-popover-after');
    });

    it('should append md-popover-above if y position is changed', () => {
      const panel = overlayContainerElement.querySelector('.md-popover-panel');
      expect(panel.classList).toContain('md-popover-above');
      expect(panel.classList).not.toContain('md-popover-below');
    });

  });

  describe('fallback positions', () => {

    it('should fall back to "before" mode if "after" mode would not fit on screen', () => {
      const fixture = TestBed.createComponent(SimplePopover);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the right side of viewport, so it doesn't have space to open
      // in its default "after" position on the right side.
      trigger.style.position = 'relative';
      trigger.style.left = '950px';

      fixture.componentInstance.trigger.openPopover();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // In "before" position, the right sides of the overlay and the origin are aligned.
      // To find the overlay left, subtract the popover width from the origin's right side.
      const expectedLeft = triggerRect.right - overlayRect.width;
      expect(Math.round(overlayRect.left))
          .toBe(Math.round(expectedLeft),
              `Expected popover to open in "before" position if "after" position wouldn't fit.`);

      // The y-position of the overlay should be unaffected, as it can already fit vertically
      expect(Math.round(overlayRect.top))
          .toBe(Math.round(triggerRect.top),
              `Expected popover top position to be unchanged if it can fit in the viewport.`);
    });

    it('should fall back to "above" mode if "below" mode would not fit on screen', () => {
      const fixture = TestBed.createComponent(SimplePopover);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // Push trigger to the bottom part of viewport, so it doesn't have space to open
      // in its default "below" position below the trigger.
      trigger.style.position = 'relative';
      trigger.style.top = '600px';

      fixture.componentInstance.trigger.openPopover();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // In "above" position, the bottom edges of the overlay and the origin are aligned.
      // To find the overlay top, subtract the popover height from the origin's bottom edge.
      const expectedTop = triggerRect.bottom - overlayRect.height;
      expect(Math.round(overlayRect.top))
          .toBe(Math.round(expectedTop),
              `Expected popover to open in "above" position if "below" position wouldn't fit.`);

      // The x-position of the overlay should be unaffected, as it can already fit horizontally
      expect(Math.round(overlayRect.left))
          .toBe(Math.round(triggerRect.left),
              `Expected popover x position to be unchanged if it can fit in the viewport.`);
    });

    it('should re-position popover on both axes if both defaults would not fit', () => {
      const fixture = TestBed.createComponent(SimplePopover);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      // push trigger to the bottom, right part of viewport, so it doesn't have space to open
      // in its default "after below" position.
      trigger.style.position = 'relative';
      trigger.style.left = '950px';
      trigger.style.top = '600px';

      fixture.componentInstance.trigger.openPopover();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      const expectedLeft = triggerRect.right - overlayRect.width;
      const expectedTop = triggerRect.bottom - overlayRect.height;

      expect(Math.round(overlayRect.left))
          .toBe(Math.round(expectedLeft),
              `Expected popover to open in "before" position if "after" position wouldn't fit.`);

      expect(Math.round(overlayRect.top))
          .toBe(Math.round(expectedTop),
              `Expected popover to open in "above" position if "below" position wouldn't fit.`);
    });

    it('should re-position a popover with custom position set', () => {
      const fixture = TestBed.createComponent(PositionedPopover);
      fixture.detectChanges();
      const trigger = fixture.componentInstance.triggerEl.nativeElement;

      fixture.componentInstance.trigger.openPopover();
      fixture.detectChanges();
      const overlayPane = getOverlayPane();
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlayPane.getBoundingClientRect();

      // As designated "before" position won't fit on screen, the popover should fall back
      // to "after" mode, where the left sides of the overlay and trigger are aligned.
      expect(Math.round(overlayRect.left))
          .toBe(Math.round(triggerRect.left),
              `Expected popover to open in "after" position if "before" position wouldn't fit.`);

      // As designated "above" position won't fit on screen, the popover should fall back
      // to "below" mode, where the top edges of the overlay and trigger are aligned.
      expect(Math.round(overlayRect.top))
          .toBe(Math.round(triggerRect.top),
              `Expected popover to open in "below" position if "above" position wouldn't fit.`);
    });

    function getOverlayPane(): HTMLElement {
      return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
    }
  });

  describe('overlapping trigger', () => {
    /**
     * This test class is used to create components containing a popover.
     * It provides helpers to reposition the trigger, open the popover,
     * and access the trigger and overlay positions.
     * Additionally it can take any inputs for the popover wrapper component.
     *
     * Basic usage:
     * const subject = new OverlapSubject(MyComponent);
     * subject.openPopover();
     */
    class OverlapSubject<T extends TestablePopover> {
      private readonly fixture: ComponentFixture<T>;
      private readonly trigger: any;

      constructor(ctor: {new(): T; }, inputs: {[key: string]: any} = {}) {
        this.fixture = TestBed.createComponent(ctor);
        extendObject(this.fixture.componentInstance, inputs);
        this.fixture.detectChanges();
        this.trigger = this.fixture.componentInstance.triggerEl.nativeElement;
      }

      openPopover() {
        this.fixture.componentInstance.trigger.openPopover();
        this.fixture.detectChanges();
      }

      updateTriggerStyle(style: any) {
        return extendObject(this.trigger.style, style);
      }

      get overlayRect() {
        return this.overlayPane.getBoundingClientRect();
      }

      get triggerRect() {
        return this.trigger.getBoundingClientRect();
      }

      get popoverPanel() {
        return overlayContainerElement.querySelector('.md-popover-panel');
      }

      private get overlayPane() {
        return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      }
    }

    let subject: OverlapSubject<OverlapPopover>;
    describe('explicitly overlapping', () => {
      beforeEach(() => {
        subject = new OverlapSubject(OverlapPopover, {overlapTrigger: true});
      });

      it('positions the overlay below the trigger', () => {
        subject.openPopover();

        // Since the popover is overlaying the trigger, the overlay top should be the trigger top.
        expect(Math.round(subject.overlayRect.top))
            .toBe(Math.round(subject.triggerRect.top),
                `Expected popover to open in default "below" position.`);
      });
    });

    describe('not overlapping', () => {
      beforeEach(() => {
        subject = new OverlapSubject(OverlapPopover, {overlapTrigger: false});
      });

      it('positions the overlay below the trigger', () => {
        subject.openPopover();

        // Since the popover is below the trigger, the overlay top should be the trigger bottom.
        expect(Math.round(subject.overlayRect.top))
            .toBe(Math.round(subject.triggerRect.bottom),
                `Expected popover to open directly below the trigger.`);
      });

      it('supports above position fall back', () => {
        // Push trigger to the bottom part of viewport, so it doesn't have space to open
        // in its default "below" position below the trigger.
        subject.updateTriggerStyle({position: 'relative', top: '650px'});
        subject.openPopover();

        // Since the popover is above the trigger, the overlay bottom should be the trigger top.
        expect(Math.round(subject.overlayRect.bottom))
            .toBe(Math.round(subject.triggerRect.top),
                `Expected popover to open in "above" position if "below" position wouldn't fit.`);
      });

      it('repositions the origin to be below, so the popover opens from the trigger', () => {
        subject.openPopover();

        expect(subject.popoverPanel.classList).toContain('md-popover-below');
        expect(subject.popoverPanel.classList).not.toContain('md-popover-above');
      });

    });
  });

  describe('animations', () => {
    it('should include the ripple on items by default', () => {
      const fixture = TestBed.createComponent(SimplePopover);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPopover();
      const item = fixture.debugElement.query(By.css('[md-popover-item]'));
      const ripple = item.query(By.css('[md-ripple]'));

      expect(ripple).not.toBeNull();
    });

    it('should remove the ripple on disabled items', () => {
      const fixture = TestBed.createComponent(SimplePopover);
      fixture.detectChanges();

      fixture.componentInstance.trigger.openPopover();
      const items = fixture.debugElement.queryAll(By.css('[md-popover-item]'));

      // items[1] is disabled, so the ripple should not be present
      const ripple = items[1].query(By.css('[md-ripple]'));
      expect(ripple).toBeNull();
    });

  });

});

@Component({
  template: `
    <button [mdPopoverTriggerFor]="popover" #triggerEl>Toggle popover</button>
    <md-popover #popover="mdPopover">
      <button md-popover-item> Item </button>
      <button md-popover-item disabled> Disabled </button>
    </md-popover>
  `
})
class SimplePopover {
  @ViewChild(MdPopoverTrigger) trigger: MdPopoverTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef;
}

@Component({
  template: `
    <button [mdPopoverTriggerFor]="popover" #triggerEl>Toggle popover</button>
    <md-popover x-position="before" y-position="above" #popover="mdPopover">
      <button md-popover-item> Positioned Content </button>
    </md-popover>
  `
})
class PositionedPopover {
  @ViewChild(MdPopoverTrigger) trigger: MdPopoverTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef;
}

interface TestablePopover {
  trigger: MdPopoverTrigger;
  triggerEl: ElementRef;
}
@Component({
  template: `
    <button [mdPopoverTriggerFor]="popover" #triggerEl>Toggle popover</button>
    <md-popover [overlapTrigger]="overlapTrigger" #popover="mdPopover">
      <button md-popover-item> Not overlapped Content </button>
    </md-popover>
  `
})
class OverlapPopover implements TestablePopover {
  @Input() overlapTrigger: boolean;
  @ViewChild(MdPopoverTrigger) trigger: MdPopoverTrigger;
  @ViewChild('triggerEl') triggerEl: ElementRef;
}

@Component({
  selector: 'custom-popover',
  template: `
    <template>
      Custom Popover header
      <ng-content></ng-content>
    </template>
  `,
  exportAs: 'mdCustomPopover'
})
class CustomPopoverPanel implements MdPopoverPanel {
  positionX: PopoverPositionX = 'after';
  positionY: PopoverPositionY = 'below';
  overlapTrigger: true;

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
  @Output() close = new EventEmitter<void>();
  focusFirstItem = () => {};
  setPositionClasses = () => {};
}

@Component({
  template: `
    <button [mdPopoverTriggerFor]="popover">Toggle popover</button>
    <custom-popover #popover="mdCustomPopover">
      <button md-popover-item> Custom Content </button>
    </custom-popover>
  `
})
class CustomPopover {
  @ViewChild(MdPopoverTrigger) trigger: MdPopoverTrigger;
}

class FakeViewportRuler {
  getViewportRect() {
    return {
      left: 0, top: 0, width: 1014, height: 686, bottom: 686, right: 1014
    };
  }

  getViewportScrollPosition() {
    return {top: 0, left: 0};
  }
}
