import {Component, DebugElement, Directive, effect, inject, signal} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {DeferredContent, DeferredContentAware} from './deferred-content';
import {By} from '@angular/platform-browser';

describe('DeferredContent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let collapsible: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    collapsible = fixture.debugElement.query(By.directive(Collapsible));
  });

  it('removes the content when hidden.', async () => {
    collapsible.injector.get(Collapsible).contentVisible.set(false);
    await fixture.whenStable();
    expect(collapsible.nativeElement.innerText).toBe('');
  });

  it('creates the content when visible.', async () => {
    collapsible.injector.get(Collapsible).contentVisible.set(true);
    await fixture.whenStable();
    expect(collapsible.nativeElement.innerText).toBe('Lazy Content');
  });

  describe('with preserveContent', () => {
    let component: TestComponent;

    beforeEach(() => {
      component = fixture.componentInstance;
      component.preserveContent.set(true);
    });

    it('creates the content when hidden.', async () => {
      collapsible.injector.get(Collapsible).contentVisible.set(false);
      await fixture.whenStable();
      expect(collapsible.nativeElement.innerText).toBe('Lazy Content');
    });

    it('creates the content when visible.', async () => {
      collapsible.injector.get(Collapsible).contentVisible.set(true);
      await fixture.whenStable();
      expect(collapsible.nativeElement.innerText).toBe('Lazy Content');
    });
  });
});

@Directive({
  selector: '[collapsible]',
  hostDirectives: [{directive: DeferredContentAware, inputs: ['preserveContent']}],
})
class Collapsible {
  private readonly _deferredContentAware = inject(DeferredContentAware);

  contentVisible = signal(true);

  constructor() {
    effect(() => this._deferredContentAware.contentVisible.set(this.contentVisible()));
  }
}

@Directive({
  selector: 'ng-template[collapsibleContent]',
  hostDirectives: [DeferredContent],
})
class CollapsibleContent {}

@Component({
  template: `
    <div collapsible [preserveContent]="preserveContent()">
      <ng-template collapsibleContent>
        Lazy Content
      </ng-template>
    </div>
    `,
  imports: [Collapsible, CollapsibleContent],
})
class TestComponent {
  preserveContent = signal(false);
}
