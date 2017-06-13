import {async, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Component, getDebugNode} from '@angular/core';
import {By} from '@angular/platform-browser';
import {Directionality, BidiModule} from './index';

describe('Directionality', () => {
  let documentElementDir, bodyDir;

  beforeAll(() => {
    documentElementDir = document.documentElement.dir;
    bodyDir = document.body.dir;
  });

  afterAll(() => {
    document.documentElement.dir = documentElementDir;
    document.body.dir = bodyDir;
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BidiModule],
      declarations: [ElementWithDir, InjectsDirectionality]
    }).compileComponents();

    clearDocumentDirAttributes();
  }));

  describe('Service', () => {
    it('should read dir from the html element if not specified on the body', () => {
      document.documentElement.dir = 'rtl';

      let fixture = TestBed.createComponent(InjectsDirectionality);
      let testComponent = fixture.debugElement.componentInstance;

      expect(testComponent.dir.value).toBe('rtl');
    });

    it('should read dir from the body even it is also specified on the html element', () => {
      document.documentElement.dir = 'ltr';
      document.body.dir = 'rtl';

      let fixture = TestBed.createComponent(InjectsDirectionality);
      let testComponent = fixture.debugElement.componentInstance;

      expect(testComponent.dir.value).toBe('rtl');
    });

    it('should default to ltr if nothing is specified on either body or the html element', () => {
      let fixture = TestBed.createComponent(InjectsDirectionality);
      let testComponent = fixture.debugElement.componentInstance;

      expect(testComponent.dir.value).toBe('ltr');
    });
  });

  describe('Dir directive', () => {
    it('should provide itself as Directionality', () => {
      let fixture = TestBed.createComponent(ElementWithDir);
      const injectedDirectionality =
        fixture.debugElement.query(By.directive(InjectsDirectionality)).componentInstance.dir;

      fixture.detectChanges();

      expect(injectedDirectionality.value).toBe('rtl');
    });

    it('should emit a change event when the value changes', fakeAsync(() => {
      let fixture = TestBed.createComponent(ElementWithDir);
      const injectedDirectionality =
        fixture.debugElement.query(By.directive(InjectsDirectionality)).componentInstance.dir;

      fixture.detectChanges();

      expect(injectedDirectionality.value).toBe('rtl');
      expect(fixture.componentInstance.changeCount).toBe(0);

      fixture.componentInstance.direction = 'ltr';

      fixture.detectChanges();
      tick();

      expect(injectedDirectionality.value).toBe('ltr');
      expect(fixture.componentInstance.changeCount).toBe(1);
    }));
  });
});


function clearDocumentDirAttributes() {
  document.documentElement.dir = '';
  document.body.dir = '';
}

@Component({
  template: `
    <div [dir]="direction" (dirChange)="changeCount= changeCount + 1">
      <injects-directionality></injects-directionality>
    </div>
  `
})
class ElementWithDir {
  direction = 'rtl';
  changeCount = 0;
}

/** Test component with Dir directive. */
@Component({
  selector: 'injects-directionality',
  template: `<div></div>`
})
class InjectsDirectionality {
  constructor(public dir: Directionality) {
  }
}
