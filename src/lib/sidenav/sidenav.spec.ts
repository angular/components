import {fakeAsync, async, tick, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatSidenav, MatSidenavModule} from './sidenav';


function endSidenavTransition(fixture: ComponentFixture<any>) {
  let sidenav: any = fixture.debugElement.query(By.directive(MatSidenav)).componentInstance;
  sidenav._onTransitionEnd(<any> {
    target: (<any>sidenav)._elementRef.nativeElement,
    propertyName: 'transform'
  });
  fixture.detectChanges();
}


describe('MatSidenav', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatSidenavModule.forRoot()],
      declarations: [
        BasicTestApp,
        SidenavLayoutTwoSidenavTestApp,
        SidenavLayoutNoSidenavTestApp,
        SidenavSetToOpenedFalse,
        SidenavSetToOpenedTrue,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('methods', () => {
    it('should be able to open and close', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);

      let testComponent: BasicTestApp = fixture.debugElement.componentInstance;
      let openButtonElement = fixture.debugElement.query(By.css('.open'));
      openButtonElement.nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(testComponent.openStartCount).toBe(1);
      expect(testComponent.openCount).toBe(0);

      endSidenavTransition(fixture);
      tick();

      expect(testComponent.openStartCount).toBe(1);
      expect(testComponent.openCount).toBe(1);
      expect(testComponent.closeStartCount).toBe(0);
      expect(testComponent.closeCount).toBe(0);

      let sidenavElement = fixture.debugElement.query(By.css('mat-sidenav'));
      let sidenavBackdropElement = fixture.debugElement.query(By.css('.mat-sidenav-backdrop'));
      expect(getComputedStyle(sidenavElement.nativeElement).visibility).toEqual('visible');
      expect(getComputedStyle(sidenavBackdropElement.nativeElement).visibility)
        .toEqual('visible');

      // Close it.
      let closeButtonElement = fixture.debugElement.query(By.css('.close'));
      closeButtonElement.nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(testComponent.openStartCount).toBe(1);
      expect(testComponent.openCount).toBe(1);
      expect(testComponent.closeStartCount).toBe(1);
      expect(testComponent.closeCount).toBe(0);

      endSidenavTransition(fixture);
      tick();

      expect(testComponent.openStartCount).toBe(1);
      expect(testComponent.openCount).toBe(1);
      expect(testComponent.closeStartCount).toBe(1);
      expect(testComponent.closeCount).toBe(1);

      expect(getComputedStyle(sidenavElement.nativeElement).visibility).toEqual('hidden');
      expect(getComputedStyle(sidenavBackdropElement.nativeElement).visibility).toEqual('hidden');
    }));

    it('open/close() return a promise that resolves after animation end', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);
      let sidenav: MatSidenav = fixture.debugElement
        .query(By.directive(MatSidenav)).componentInstance;
      let called = false;

      sidenav.open().then(() => {
        called = true;
      });

      expect(called).toBe(false);
      endSidenavTransition(fixture);
      tick();
      expect(called).toBe(true);

      called = false;
      sidenav.close().then(() => {
        called = true;
      });

      expect(called).toBe(false);
      endSidenavTransition(fixture);
      tick();
      expect(called).toBe(true);

    }));

    it('open/close() twice returns the same promise', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);
      let sidenav: MatSidenav = fixture.debugElement
        .query(By.directive(MatSidenav)).componentInstance;

      let promise = sidenav.open();
      expect(sidenav.open()).toBe(promise);
      fixture.detectChanges();
      tick();

      promise = sidenav.close();
      expect(sidenav.close()).toBe(promise);
      tick();
    }));

    it('open() then close() cancel animations when called too fast', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);
      let sidenav: MatSidenav = fixture.debugElement
        .query(By.directive(MatSidenav)).componentInstance;

      let openCalled = false;
      let openCancelled = false;
      let closeCalled = false;

      sidenav.open().then(() => {
        openCalled = true;
      }, () => {
        openCancelled = true;
      });

      // We do not call transition end, close directly.
      sidenav.close().then(() => {
        closeCalled = true;
      });

      endSidenavTransition(fixture);
      tick();

      expect(openCalled).toBe(false);
      expect(openCancelled).toBe(true);
      expect(closeCalled).toBe(true);
      tick();
    }));

    it('close() then open() cancel animations when called too fast', fakeAsync(() => {
      let fixture = TestBed.createComponent(BasicTestApp);
      let sidenav: MatSidenav = fixture.debugElement
        .query(By.directive(MatSidenav)).componentInstance;

      let closeCalled = false;
      let closeCancelled = false;
      let openCalled = false;

      // First, open the sidenav completely.
      sidenav.open();
      endSidenavTransition(fixture);
      tick();

      // Then close and check behavior.
      sidenav.close().then(() => {
        closeCalled = true;
      }, () => {
        closeCancelled = true;
      });
      // We do not call transition end, open directly.
      sidenav.open().then(() => {
        openCalled = true;
      });

      endSidenavTransition(fixture);
      tick();

      expect(closeCalled).toBe(false);
      expect(closeCancelled).toBe(true);
      expect(openCalled).toBe(true);
      tick();
    }));

    it('does not throw when created without a sidenav', fakeAsync(() => {
      expect(() => {
        let fixture = TestBed.createComponent(BasicTestApp);
        fixture.detectChanges();
        tick();
      }).not.toThrow();
    }));

    it('does throw when created with two sidenav on the same side', fakeAsync(() => {
      expect(() => {
        let fixture = TestBed.createComponent(SidenavLayoutTwoSidenavTestApp);
        fixture.detectChanges();
        tick();
      }).toThrow();
    }));
  });

  describe('attributes', () => {

    it('should correctly parse opened="false"', () => {
      let fixture = TestBed.createComponent(SidenavSetToOpenedFalse);
      fixture.detectChanges();

      let sidenavEl = fixture.debugElement.query(By.css('mat-sidenav')).nativeElement;

      expect(sidenavEl.classList).toContain('mat-sidenav-closed');
      expect(sidenavEl.classList).not.toContain('mat-sidenav-opened');
    });

    it('should correctly parse opened="true"', () => {
      let fixture = TestBed.createComponent(SidenavSetToOpenedTrue);
      fixture.detectChanges();

      let sidenavEl = fixture.debugElement.query(By.css('mat-sidenav')).nativeElement;

      expect(sidenavEl.classList).not.toContain('mat-sidenav-closed');
      expect(sidenavEl.classList).toContain('mat-sidenav-opened');
    });

  });

});


/** Test component that contains an MatSidenavLayout but no MatSidenav. */
@Component({template: `<mat-sidenav-layout></mat-sidenav-layout>`})
class SidenavLayoutNoSidenavTestApp { }

/** Test component that contains an MatSidenavLayout and 2 MatSidenav on the same side. */
@Component({
  template: `
    <mat-sidenav-layout>
      <mat-sidenav> </mat-sidenav>
      <mat-sidenav> </mat-sidenav>
    </mat-sidenav-layout>`,
})
class SidenavLayoutTwoSidenavTestApp { }

/** Test component that contains an MatSidenavLayout and one MatSidenav. */
@Component({
  template: `
    <mat-sidenav-layout>
      <mat-sidenav #sidenav align="start"
                  (open-start)="openStart()"
                  (open)="open()"
                  (close-start)="closeStart()"
                  (close)="close()">
        Content.
      </mat-sidenav>
      <button (click)="sidenav.open()" class="open"></button>
      <button (click)="sidenav.close()" class="close"></button>
    </mat-sidenav-layout>`,
})
class BasicTestApp {
  openStartCount: number = 0;
  openCount: number = 0;
  closeStartCount: number = 0;
  closeCount: number = 0;

  openStart() {
    this.openStartCount++;
  }

  open() {
    this.openCount++;
  }

  closeStart() {
    this.closeStartCount++;
  }

  close() {
    this.closeCount++;
  }
}

@Component({
  template: `
    <mat-sidenav-layout>
      <mat-sidenav #sidenav mode="side" opened="false">
        Closed Sidenav.
      </mat-sidenav>
    </mat-sidenav-layout>`,
})
class SidenavSetToOpenedFalse { }

@Component({
  template: `
    <mat-sidenav-layout>
      <mat-sidenav #sidenav mode="side" opened="true">
        Closed Sidenav.
      </mat-sidenav>
    </mat-sidenav-layout>`,
})
class SidenavSetToOpenedTrue { }
