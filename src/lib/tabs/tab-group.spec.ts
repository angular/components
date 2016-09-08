import {async, fakeAsync, tick, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatTabGroup, MatTabsModule} from './tabs';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {Observable} from 'rxjs/Observable';


describe('MatTabGroup', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatTabsModule.forRoot()],
      declarations: [
        SimpleTabsTestApp,
        AsyncTabsTestApp,
        DisabledTabsTestApp
      ],
    });

    TestBed.compileComponents();
  }));

  describe('basic behavior', () => {
    let fixture: ComponentFixture<SimpleTabsTestApp>;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(SimpleTabsTestApp);
    }));

    it('should default to the first tab', async(() => {
      checkSelectedIndex(1, fixture);
    }));

    it('should change selected index on click', async(() => {
      let component = fixture.debugElement.componentInstance;
      component.selectedIndex = 0;
      checkSelectedIndex(0, fixture);

      // select the second tab
      let tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
      tabLabel.nativeElement.click();
      checkSelectedIndex(1, fixture);

      // select the third tab
      tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[2];
      tabLabel.nativeElement.click();
      checkSelectedIndex(2, fixture);
    }));

    it('should support two-way binding for selectedIndex', async(() => {
      let component = fixture.componentInstance;
      component.selectedIndex = 0;

      fixture.detectChanges();

      let tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
      tabLabel.nativeElement.click();

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.selectedIndex).toBe(1);
      });
    }));

    it('should cycle tab focus with focusNextTab/focusPreviousTab functions', fakeAsync(() => {
      let testComponent = fixture.componentInstance;
      let tabComponent = fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;

      spyOn(testComponent, 'handleFocus').and.callThrough();
      fixture.detectChanges();

      tabComponent.focusIndex = 0;
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(0);
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(1);
      expect(testComponent.focusEvent.index).toBe(0);

      tabComponent.focusNextTab();
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(1);
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(2);
      expect(testComponent.focusEvent.index).toBe(1);

      tabComponent.focusNextTab();
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(2);
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(3);
      expect(testComponent.focusEvent.index).toBe(2);

      tabComponent.focusNextTab();
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(2); // should stop at 2
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(3);
      expect(testComponent.focusEvent.index).toBe(2);

      tabComponent.focusPreviousTab();
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(1);
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(4);
      expect(testComponent.focusEvent.index).toBe(1);

      tabComponent.focusPreviousTab();
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(0);
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(5);
      expect(testComponent.focusEvent.index).toBe(0);

      tabComponent.focusPreviousTab();
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(0); // should stop at 0
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(5);
      expect(testComponent.focusEvent.index).toBe(0);
    }));

    it('should change tabs based on selectedIndex', fakeAsync(() => {
      let component = fixture.componentInstance;
      let tabComponent = fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;

      spyOn(component, 'handleSelection').and.callThrough();

      checkSelectedIndex(1, fixture);

      tabComponent.selectedIndex = 2;

      checkSelectedIndex(2, fixture);
      tick();

      expect(component.handleSelection).toHaveBeenCalledTimes(1);
      expect(component.selectEvent.index).toBe(2);
    }));
  });

  describe('disabled tabs', () => {
    let fixture: ComponentFixture<DisabledTabsTestApp>;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(DisabledTabsTestApp);
      fixture.detectChanges();
    }));

    it('should disable the second tab', () => {
      let labels = fixture.debugElement.queryAll(By.css('.mat-tab-label'));

      expect(labels[1].nativeElement.classList.contains('mat-tab-disabled')).toBeTruthy();
    });

    it('should skip over disabled tabs when navigating by keyboard', () => {
      let component: MatTabGroup = fixture.debugElement.query(By.css('mat-tab-group'))
          .componentInstance;

      component.focusIndex = 0;
      component.focusNextTab();

      expect(component.focusIndex).toBe(2);

      component.focusNextTab();
      expect(component.focusIndex).toBe(2);

      component.focusPreviousTab();
      expect(component.focusIndex).toBe(0);

      component.focusPreviousTab();
      expect(component.focusIndex).toBe(0);
    });

    it('should ignore attempts to select a disabled tab', () => {
      let component: MatTabGroup = fixture.debugElement.query(By.css('mat-tab-group'))
          .componentInstance;

      component.selectedIndex = 0;
      expect(component.selectedIndex).toBe(0);

      component.selectedIndex = 1;
      expect(component.selectedIndex).toBe(0);
    });

    it('should ignore attempts to focus a disabled tab', () => {
      let component: MatTabGroup = fixture.debugElement.query(By.css('mat-tab-group'))
          .componentInstance;

      component.focusIndex = 0;
      expect(component.focusIndex).toBe(0);

      component.focusIndex = 1;
      expect(component.focusIndex).toBe(0);
    });

    it('should ignore attempts to set invalid selectedIndex', () => {
      let component: MatTabGroup = fixture.debugElement.query(By.css('mat-tab-group'))
          .componentInstance;

      component.selectedIndex = 0;
      expect(component.selectedIndex).toBe(0);

      component.selectedIndex = -1;
      expect(component.selectedIndex).toBe(0);

      component.selectedIndex = 4;
      expect(component.selectedIndex).toBe(0);
    });

    it('should ignore attempts to set invalid focusIndex', () => {
      let component: MatTabGroup = fixture.debugElement.query(By.css('mat-tab-group'))
          .componentInstance;

      component.focusIndex = 0;
      expect(component.focusIndex).toBe(0);

      component.focusIndex = -1;
      expect(component.focusIndex).toBe(0);

      component.focusIndex = 4;
      expect(component.focusIndex).toBe(0);
    });
  });

  describe('async tabs', () => {
    let fixture: ComponentFixture<AsyncTabsTestApp>;

    it('should show tabs when they are available', async(() => {
      fixture = TestBed.createComponent(AsyncTabsTestApp);

      let labels = fixture.debugElement.queryAll(By.css('.mat-tab-label'));

      expect(labels.length).toBe(0);

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        labels = fixture.debugElement.queryAll(By.css('.mat-tab-label'));
        expect(labels.length).toBe(2);
      });
    }));
  });

  /**
   * Checks that the `selectedIndex` has been updated; checks that the label and body have the
   * `mat-tab-active` class
   */
  function checkSelectedIndex(index: number, fixture: ComponentFixture<any>) {
    fixture.detectChanges();

    let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;
    expect(tabComponent.selectedIndex).toBe(index);

    let tabLabelElement = fixture.debugElement
        .query(By.css(`.mat-tab-label:nth-of-type(${index + 1})`)).nativeElement;
    expect(tabLabelElement.classList.contains('mat-tab-active')).toBe(true);

    let tabContentElement = fixture.debugElement
        .query(By.css(`#${tabLabelElement.id}`)).nativeElement;
    expect(tabContentElement.classList.contains('mat-tab-active')).toBe(true);
  }
});

@Component({
  selector: 'test-app',
  template: `
    <mat-tab-group class="tab-group"
        [(selectedIndex)]="selectedIndex"
        (focusChange)="handleFocus($event)"
        (selectChange)="handleSelection($event)">
      <mat-tab>
        <template mat-tab-label>Tab One</template>
        <template mat-tab-content>Tab one content</template>
      </mat-tab>
      <mat-tab>
        <template mat-tab-label>Tab Two</template>
        <template mat-tab-content>Tab two content</template>
      </mat-tab>
      <mat-tab>
        <template mat-tab-label>Tab Three</template>
        <template mat-tab-content>Tab three content</template>
      </mat-tab>
    </mat-tab-group>
  `
})
class SimpleTabsTestApp {
  selectedIndex: number = 1;
  focusEvent: any;
  selectEvent: any;
  handleFocus(event: any) {
    this.focusEvent = event;
  }
  handleSelection(event: any) {
    this.selectEvent = event;
  }
}

@Component({
  selector: 'test-app',
  template: `
    <mat-tab-group class="tab-group">
      <mat-tab>
        <template mat-tab-label>Tab One</template>
        <template mat-tab-content>Tab one content</template>
      </mat-tab>
      <mat-tab disabled>
        <template mat-tab-label>Tab Two</template>
        <template mat-tab-content>Tab two content</template>
      </mat-tab>
      <mat-tab>
        <template mat-tab-label>Tab Three</template>
        <template mat-tab-content>Tab three content</template>
      </mat-tab>
    </mat-tab-group>
  `,
})
class DisabledTabsTestApp {}

@Component({
  selector: 'test-app',
  template: `
    <mat-tab-group class="tab-group">
      <mat-tab *ngFor="let tab of tabs | async">
        <template mat-tab-label>{{ tab.label }}</template>
        <template mat-tab-content>{{ tab.content }}</template>
      </mat-tab>
   </mat-tab-group>
  `
})
class AsyncTabsTestApp {
  private _tabs = [
    { label: 'one', content: 'one' },
    { label: 'two', content: 'two' }
  ];

  tabs: Observable<any>;

  // Use ngOnInit because there is some issue with scheduling the async task in the constructor.
  ngOnInit() {
    this.tabs = Observable.create((observer: any) => {
      requestAnimationFrame(() => observer.next(this._tabs));
    });
  }
}
