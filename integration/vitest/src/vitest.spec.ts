import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideZoneChangeDetection} from '@angular/core';

// Note: these files will be copied in before the test is executed. See `setup-test-files.mjs`.
import {crossEnvironmentSpecs} from './cdk-tests/cross-environment-tests';
// tslint:disable-next-line:no-unused-variable
import {FakeOverlayHarness} from './cdk-tests/harnesses/fake-overlay-harness';
import {MainComponentHarness} from './cdk-tests/harnesses/main-component-harness';
import {TestMainComponent} from './cdk-tests/test-main-component';

describe('Vitest with TestbedHarnessEnvironment', () => {
  let fixture: ComponentFixture<{}>;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideZoneChangeDetection()]});
    fixture = TestBed.createComponent(TestMainComponent);
  });

  describe('environment specific', () => {
    describe('HarnessLoader', () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      });

      it('should create HarnessLoader from fixture', () => {
        expect(loader).not.toBeNull();
      });

      it('should create ComponentHarness for fixture', async () => {
        const harness = await TestbedHarnessEnvironment.harnessForFixture(
          fixture,
          MainComponentHarness,
        );
        expect(harness).not.toBeNull();
      });

      // TODO(crisbeto): this _should_ work with a virtual DOM.
      // Investigate the failure and enable the test.
      // it('should be able to load harness through document root loader', async () => {
      //   const documentRootHarnesses =
      //     await TestbedHarnessEnvironment.documentRootLoader(fixture).getAllHarnesses(
      //       FakeOverlayHarness,
      //     );
      //   const fixtureHarnesses = await loader.getAllHarnesses(FakeOverlayHarness);
      //   expect(fixtureHarnesses.length).toBe(0);
      //   expect(documentRootHarnesses.length).toBe(1);
      //   expect(await documentRootHarnesses[0].getDescription()).toBe('This is a fake overlay.');
      // });
    });

    describe('ComponentHarness', () => {
      let harness: MainComponentHarness;

      beforeEach(async () => {
        harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, MainComponentHarness);
      });

      it('can get elements outside of host', async () => {
        const subcomponents = await harness.allLists();
        expect(subcomponents[0]).not.toBeNull();
        const globalEl = await subcomponents[0]!.globalElement();
        expect(globalEl).not.toBeNull();
        expect(await globalEl.text()).toBe('Hello Yi from Angular!');
      });

      it('should be able to retrieve the native DOM element from a UnitTestElement', async () => {
        const element = TestbedHarnessEnvironment.getNativeElement(await harness.host());
        expect(element.id).toContain('root');
      });
    });
  });

  describe('environment independent', () =>
    crossEnvironmentSpecs(
      () => TestbedHarnessEnvironment.loader(fixture),
      () => TestbedHarnessEnvironment.harnessForFixture(fixture, MainComponentHarness),
      () => Promise.resolve(document.activeElement!.id),
      {skipAsyncTests: false, isVirtualDom: true},
    ));
});
