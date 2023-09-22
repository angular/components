import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatSidenavModule} from '@angular/material/sidenav';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDrawerContainerHarness} from './drawer-container-harness';
import {MatDrawerContentHarness} from './drawer-content-harness';
import {MatDrawerHarness} from './drawer-harness';
import {MatSidenavContainerHarness} from './sidenav-container-harness';
import {MatSidenavContentHarness} from './sidenav-content-harness';
import {MatSidenavHarness} from './sidenav-harness';

describe('MatSidenavHarness', () => {
  describe('drawer', () => {
    let fixture: ComponentFixture<DrawerHarnessTest>;
    let loader: HarnessLoader;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatSidenavModule, NoopAnimationsModule],
        declarations: [DrawerHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(DrawerHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should load all drawer harnesses', async () => {
      const drawers = await loader.getAllHarnesses(MatDrawerHarness);
      expect(drawers.length).toBe(3);
    });

    it('should load drawer harness based on position', async () => {
      const drawers = await loader.getAllHarnesses(MatDrawerHarness.with({position: 'end'}));
      expect(drawers.length).toBe(1);
      expect(await (await drawers[0].host()).text()).toBe('Two');
    });

    it('should be able to get whether the drawer is open', async () => {
      const drawers = await loader.getAllHarnesses(MatDrawerHarness);

      expect(await drawers[0].isOpen()).toBe(false);
      expect(await drawers[1].isOpen()).toBe(false);
      expect(await drawers[2].isOpen()).toBe(true);

      fixture.componentInstance.threeOpened = false;
      fixture.detectChanges();

      expect(await drawers[0].isOpen()).toBe(false);
      expect(await drawers[1].isOpen()).toBe(false);
      expect(await drawers[2].isOpen()).toBe(false);
    });

    it('should be able to get the position of a drawer', async () => {
      const drawers = await loader.getAllHarnesses(MatDrawerHarness);

      expect(await drawers[0].getPosition()).toBe('start');
      expect(await drawers[1].getPosition()).toBe('end');
      expect(await drawers[2].getPosition()).toBe('start');
    });

    it('should be able to get the mode of a drawer', async () => {
      const drawers = await loader.getAllHarnesses(MatDrawerHarness);

      expect(await drawers[0].getMode()).toBe('over');
      expect(await drawers[1].getMode()).toBe('side');
      expect(await drawers[2].getMode()).toBe('push');
    });

    it('should load all drawer container harnesses', async () => {
      const containers = await loader.getAllHarnesses(MatDrawerContainerHarness);
      expect(containers.length).toBe(2);
    });

    it('should get the drawers within a container', async () => {
      const containers = await loader.getAllHarnesses(MatDrawerContainerHarness);
      const [firstContainerDrawers, secondContainerDrawers] = await parallel(() => {
        return containers.map(container => container.getDrawers());
      });

      expect(
        await parallel(() => {
          return firstContainerDrawers.map(async container => (await container.host()).text());
        }),
      ).toEqual(['One', 'Two']);

      expect(
        await parallel(() => {
          return secondContainerDrawers.map(async container => (await container.host()).text());
        }),
      ).toEqual(['Three']);
    });

    it('should get the content of a container', async () => {
      const container = await loader.getHarness(MatDrawerContainerHarness);
      const content = await container.getContent();
      expect(await (await content.host()).text()).toBe('Content');
    });

    it('should load all drawer content harnesses', async () => {
      const contentElements = await loader.getAllHarnesses(MatDrawerContentHarness);
      expect(contentElements.length).toBe(2);
    });
  });

  describe('sidenav', () => {
    let fixture: ComponentFixture<SidenavHarnessTest>;
    let loader: HarnessLoader;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatSidenavModule, NoopAnimationsModule],
        declarations: [SidenavHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(SidenavHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should be able to get whether a sidenav is fixed in the viewport', async () => {
      const sidenavs = await loader.getAllHarnesses(MatSidenavHarness);

      expect(await sidenavs[0].isFixedInViewport()).toBe(false);
      expect(await sidenavs[1].isFixedInViewport()).toBe(false);
      expect(await sidenavs[2].isFixedInViewport()).toBe(true);
    });

    it('should load all sidenav container harnesses', async () => {
      const containers = await loader.getAllHarnesses(MatSidenavContainerHarness);
      expect(containers.length).toBe(2);
    });

    it('should get the sidenavs within a container', async () => {
      const containers = await loader.getAllHarnesses(MatSidenavContainerHarness);
      const [firstContainerSidenavs, secondContainerSidenavs] = await parallel(() => {
        return containers.map(container => container.getSidenavs());
      });

      expect(
        await parallel(() => {
          return firstContainerSidenavs.map(async container => (await container.host()).text());
        }),
      ).toEqual(['One', 'Two']);

      expect(
        await parallel(() => {
          return secondContainerSidenavs.map(async container => (await container.host()).text());
        }),
      ).toEqual(['Three']);
    });

    it('should get the content of a container', async () => {
      const container = await loader.getHarness(MatSidenavContainerHarness);
      const content = await container.getContent();
      expect(await (await content.host()).text()).toBe('Content');
    });

    it('should load all sidenav content harnesses', async () => {
      const contentElements = await loader.getAllHarnesses(MatSidenavContentHarness);
      expect(contentElements.length).toBe(2);
    });
  });
});

@Component({
  template: `
    <mat-drawer-container>
      <mat-drawer id="one" position="start">One</mat-drawer>
      <mat-drawer id="two" mode="side" position="end">Two</mat-drawer>
      <mat-drawer-content>Content</mat-drawer-content>
    </mat-drawer-container>

    <mat-drawer-container>
      <mat-drawer id="three" mode="push" [opened]="threeOpened">Three</mat-drawer>
      <mat-drawer-content>Content</mat-drawer-content>
    </mat-drawer-container>
  `,
})
class DrawerHarnessTest {
  threeOpened = true;
}

@Component({
  template: `
    <mat-sidenav-container>
      <mat-sidenav id="one" position="start">One</mat-sidenav>
      <mat-sidenav id="two" position="end">Two</mat-sidenav>
      <mat-sidenav-content>Content</mat-sidenav-content>
    </mat-sidenav-container>

    <mat-sidenav-container>
      <mat-sidenav id="three" fixedInViewport>Three</mat-sidenav>
      <mat-sidenav-content>Content</mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
class SidenavHarnessTest {}
