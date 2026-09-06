import {_supportsShadowDom} from '../../platform';
import {ComponentHarness, HarnessLoader, manualChangeDetection, parallel} from '../../testing';
import {TestbedHarnessEnvironment} from '../../testing/testbed';
import {
  ComponentFixture,
  DirectiveFixture,
  fakeAsync,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {Directive, provideZoneChangeDetection} from '@angular/core';
import {querySelectorAll as piercingQuerySelectorAll} from 'kagekiri';
import {crossEnvironmentSpecs} from './cross-environment-tests';
import {FakeOverlayHarness} from './harnesses/fake-overlay-harness';
import {MainComponentHarness} from './harnesses/main-component-harness';
import {TestMainComponent} from './test-main-component';

describe('TestbedHarnessEnvironment', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });

  describe('ComponentFixture', () => {
    let fixture: ComponentFixture<{}>;

    beforeEach(() => {
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

        it('should be able to load harness through document root loader', async () => {
          const documentRootHarnesses =
            await TestbedHarnessEnvironment.documentRootLoader(fixture).getAllHarnesses(
              FakeOverlayHarness,
            );
          const fixtureHarnesses = await loader.getAllHarnesses(FakeOverlayHarness);
          expect(fixtureHarnesses.length).toBe(0);
          expect(documentRootHarnesses.length).toBe(1);
          expect(await documentRootHarnesses[0].getDescription()).toBe('This is a fake overlay.');
        });
      });

      describe('harness', () => {
        let harness: MainComponentHarness;

        beforeEach(async () => {
          harness = await TestbedHarnessEnvironment.harnessForFixture(
            fixture,
            MainComponentHarness,
          );
        });

        it('can get elements outside of host', async () => {
          const subcomponents = await harness.allLists();
          expect(subcomponents[0]).not.toBeNull();
          const globalEl = await subcomponents[0]!.globalElement();
          expect(globalEl).not.toBeNull();
          expect(await globalEl.text()).toBe('Hello Yi from Angular!');
        });

        it('should be able to wait for tasks outside of Angular within native async/await', async () => {
          expect(await harness.getTaskStateResult()).toBe('result');
        });

        it('should be able to wait for tasks outside of Angular within async test zone', waitForAsync(() => {
          harness.getTaskStateResult().then(res => expect(res).toBe('result'));
        }));

        it('should be able to wait for tasks outside of Angular within fakeAsync test zone', fakeAsync(async () => {
          expect(await harness.getTaskStateResult()).toBe('result');
        }));

        it('should be able to retrieve the native DOM element from a UnitTestElement', async () => {
          const element = TestbedHarnessEnvironment.getNativeElement(await harness.host());
          expect(element.id).toContain('root');
        });

        it('should wait for async operation to complete in fakeAsync test', fakeAsync(async () => {
          const asyncCounter = await harness.asyncCounter();
          expect(await asyncCounter.text()).toBe('5');
          await harness.increaseCounter(3);
          expect(await asyncCounter.text()).toBe('8');
        }));
      });

      describe('change detection behavior', () => {
        it('manualChangeDetection should prevent auto change detection', async () => {
          const detectChangesSpy = spyOn(fixture, 'detectChanges').and.callThrough();
          const harness = await TestbedHarnessEnvironment.harnessForFixture(
            fixture,
            MainComponentHarness,
          );
          detectChangesSpy.calls.reset();
          await manualChangeDetection(async () => {
            const button = await harness.button();
            await button.text();
            await button.click();
          });
          expect(detectChangesSpy).toHaveBeenCalledTimes(0);
        });

        it('parallel should only auto detect changes once before and after', async () => {
          const detectChangesSpy = spyOn(fixture, 'detectChanges').and.callThrough();
          const harness = await TestbedHarnessEnvironment.harnessForFixture(
            fixture,
            MainComponentHarness,
          );

          // Run them in "parallel" (though the order is guaranteed because of how we constructed the
          // promises.
          detectChangesSpy.calls.reset();
          expect(detectChangesSpy).toHaveBeenCalledTimes(0);
          await parallel(() => {
            // Chain together our promises to ensure the before clause runs first and the after clause
            // runs last.
            const before = Promise.resolve().then(() =>
              expect(detectChangesSpy).toHaveBeenCalledTimes(1),
            );
            const actions = before.then(() =>
              Promise.all(Array.from({length: 5}, () => harness.button().then(b => b.click()))),
            );
            const after = actions.then(() => expect(detectChangesSpy).toHaveBeenCalledTimes(1));

            return [before, actions, after];
          });
          expect(detectChangesSpy).toHaveBeenCalledTimes(2);
        });

        it('parallel inside manualChangeDetection should not cause change detection', async () => {
          const detectChangesSpy = spyOn(fixture, 'detectChanges').and.callThrough();
          const harness = await TestbedHarnessEnvironment.harnessForFixture(
            fixture,
            MainComponentHarness,
          );
          detectChangesSpy.calls.reset();
          await manualChangeDetection(() =>
            parallel(() => Array.from({length: 5}, () => harness.button().then(b => b.click()))),
          );
          expect(detectChangesSpy).toHaveBeenCalledTimes(0);
        });
      });

      if (_supportsShadowDom()) {
        describe('shadow DOM interaction', () => {
          it('should not pierce shadow boundary by default', async () => {
            const harness = await TestbedHarnessEnvironment.harnessForFixture(
              fixture,
              MainComponentHarness,
            );
            expect(await harness.shadows()).toEqual([]);
          });

          it('should pierce shadow boundary when using piercing query', async () => {
            const harness = await TestbedHarnessEnvironment.harnessForFixture(
              fixture,
              MainComponentHarness,
              {queryFn: piercingQuerySelectorAll},
            );
            const shadows = await harness.shadows();
            expect(
              await parallel(() => {
                return shadows.map(el => el.text());
              }),
            ).toEqual(['Shadow 1', 'Shadow 2']);
          });

          it('should allow querying across shadow boundary', async () => {
            const harness = await TestbedHarnessEnvironment.harnessForFixture(
              fixture,
              MainComponentHarness,
              {queryFn: piercingQuerySelectorAll},
            );
            expect(await (await harness.deepShadow()).text()).toBe('Shadow 2');
          });
        });
      }
    });

    describe('environment independent', () =>
      crossEnvironmentSpecs(
        () => TestbedHarnessEnvironment.loader(fixture),
        () => TestbedHarnessEnvironment.harnessForFixture(fixture, MainComponentHarness),
        () => Promise.resolve(document.activeElement!.id),
      ));
  });

  describe('DirectiveFixture', () => {
    let fixture: DirectiveFixture<TestDirective>;
    let loader: HarnessLoader;

    beforeEach(() => {
      fixture = TestBed.createDirective(TestDirective);
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    describe('HarnessLoader', () => {
      it('should create HarnessLoader from fixture', () => {
        expect(loader).not.toBeNull();
      });

      it('should create ComponentHarness for fixture', async () => {
        const harness = await TestbedHarnessEnvironment.harnessForFixture(
          fixture,
          TestDirectiveHarness,
        );
        expect(harness).not.toBeNull();
      });
    });

    it('should be able to retrieve the native DOM element from a UnitTestElement', async () => {
      const harness = await TestbedHarnessEnvironment.harnessForFixture(
        fixture,
        TestDirectiveHarness,
      );
      const element = TestbedHarnessEnvironment.getNativeElement(await harness.host());
      expect(element).toBe(fixture.nativeElement);
      expect(element.tagName.toLowerCase()).toBe('button');
    });

    describe('change detection behavior', () => {
      let harness: TestDirectiveHarness;

      beforeEach(async () => {
        harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TestDirectiveHarness);
      });

      it('should auto-detect changes when interacting with harness', async () => {
        expect(await harness.isActive()).toBe(false);
        await harness.click();
        expect(await harness.isActive()).toBe(true);
      });

      it('manualChangeDetection should prevent auto change detection', async () => {
        const detectChangesSpy = spyOn(fixture, 'detectChanges').and.callThrough();
        detectChangesSpy.calls.reset();
        await manualChangeDetection(async () => {
          await harness.click();
        });
        expect(detectChangesSpy).toHaveBeenCalledTimes(0);
      });

      it('parallel should only auto detect changes once before and after', async () => {
        const detectChangesSpy = spyOn(fixture, 'detectChanges').and.callThrough();
        detectChangesSpy.calls.reset();
        expect(detectChangesSpy).toHaveBeenCalledTimes(0);
        await parallel(() => {
          const before = Promise.resolve().then(() =>
            expect(detectChangesSpy).toHaveBeenCalledTimes(1),
          );
          const actions = before.then(() =>
            Promise.all(Array.from({length: 5}, () => harness.click())),
          );
          const after = actions.then(() => expect(detectChangesSpy).toHaveBeenCalledTimes(1));

          return [before, actions, after];
        });
        expect(detectChangesSpy).toHaveBeenCalledTimes(2);
      });

      it('parallel inside manualChangeDetection should not cause change detection', async () => {
        const detectChangesSpy = spyOn(fixture, 'detectChanges').and.callThrough();
        detectChangesSpy.calls.reset();
        await manualChangeDetection(() =>
          parallel(() => Array.from({length: 5}, () => harness.click())),
        );
        expect(detectChangesSpy).toHaveBeenCalledTimes(0);
      });
    });

    it('should work with directive created with tagName option', async () => {
      const customFixture = TestBed.createDirective(TestDirectiveNoTag, {tagName: 'div'});
      const customHarness = await TestbedHarnessEnvironment.harnessForFixture(
        customFixture,
        TestDirectiveNoTagHarness,
      );
      expect(customFixture.nativeElement.tagName.toLowerCase()).toBe('div');
      expect(await customHarness.isCustom()).toBe(true);
    });
  });
});

@Directive({
  selector: 'button[test-dir]',
  host: {
    '[class.active]': 'active',
    '(click)': 'onClick()',
  },
})
class TestDirective {
  active = false;
  clickCount = 0;

  onClick() {
    this.active = !this.active;
    this.clickCount++;
  }
}

@Directive({
  selector: '[test-dir-no-tag]',
  host: {
    '[class.custom]': 'true',
  },
})
class TestDirectiveNoTag {}

class TestDirectiveHarness extends ComponentHarness {
  static readonly hostSelector = 'button[test-dir]';

  readonly child = this.locatorFor('.child');
  readonly asyncCounter = this.locatorFor('.async-counter');
  readonly asyncButton = this.locatorFor('.async-button');

  async isActive(): Promise<boolean> {
    return (await this.host()).hasClass('active');
  }

  async click(): Promise<void> {
    return (await this.host()).click();
  }

  async getChildText(): Promise<string> {
    return (await this.child()).text();
  }

  async getAsyncCounterText(): Promise<string> {
    return (await this.asyncCounter()).text();
  }

  async triggerAsync(): Promise<void> {
    return (await this.asyncButton()).click();
  }
}

class TestDirectiveNoTagHarness extends ComponentHarness {
  static readonly hostSelector = '[test-dir-no-tag]';

  async isCustom(): Promise<boolean> {
    return (await this.host()).hasClass('custom');
  }
}
