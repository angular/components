import {
  async,
  TestBed,
} from '@angular/core/testing';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {MdInput, MdInputModule} from './input';
import {ProjectionModule} from '../core/projection/projection';

describe('MdInput', function () {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdInputModule.forRoot(), FormsModule, ProjectionModule.forRoot()],
      declarations: [
        MdInputStyleClassTransferedTestComponent,
        MdInputNumberTypeConservedTestComponent,
        MdInputInvalidTypeTestController,
        MdInputBaseTestController,
        MdTextareaWithBindings,
      ],
    });

    TestBed.compileComponents();
  }));

  it('creates a native <input> element', () => {
    let fixture = TestBed.createComponent(MdInputBaseTestController);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
  });

  // TODO(kara): update when core/testing adds fix
  it('support ngModel', async(() => {
    let fixture = TestBed.createComponent(MdInputBaseTestController);

    fixture.detectChanges();
    let instance = fixture.componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    instance.model = 'hello';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      // Temporary workaround, see https://github.com/angular/angular/issues/10148
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(el.value).toBe('hello');
      });
    });
  }));

  it('moves the class and style to the outer container', async(() => {
    let fixture = TestBed.createComponent(MdInputStyleClassTransferedTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.directive(MdInput)).nativeElement;
    expect(el.getAttribute('class')).toBeNull();
    expect(el.getAttribute('style')).toBeNull();
  }));

  it('counts characters', async(() => {
    let fixture = TestBed.createComponent(MdInputBaseTestController);
    let instance = fixture.componentInstance;
    fixture.detectChanges();
    let inputInstance = fixture.debugElement.query(By.directive(MdInput)).componentInstance;
    expect(inputInstance.characterCount).toEqual(0);

    instance.model = 'hello';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(inputInstance.characterCount).toEqual(5);
    });
  }));

  it('validates the type', () => {
    let fixture = TestBed.createComponent(MdInputInvalidTypeTestController);

    // Technically this throws during the OnChanges detection phase,
    // so the error is really a ChangeDetectionError and it becomes
    // hard to build a full exception to compare with.
    // We just check for any exception in this case.
    expect(() => fixture.detectChanges()).toThrow(/* new MdInputUnsupportedTypeError('file') */);
  });

  describe('md-textarea', () => {
    it('supports the rows, cols, and wrap attributes', () => {
      let fixture = TestBed.createComponent(MdTextareaWithBindings);

      fixture.detectChanges();

      const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textarea.rows).toBe(4);
      expect(textarea.cols).toBe(8);
      expect(textarea.wrap).toBe('hard');
    });
  });

});

@Component({template: `<input md-input type="number" class="test-class" style="color: 123456">`})
class MdInputStyleClassTransferedTestComponent {
}

@Component({template: `<input md-input type="number" [(ngModel)]="value">`})
class MdInputNumberTypeConservedTestComponent {
  value: number = 0;
}

@Component({template: `<input md-input type="file">`})
class MdInputInvalidTypeTestController { }

@Component({template: `<input md-input [(ngModel)]="model">`})
class MdInputBaseTestController {
  model: any = '';
}

@Component({
  template: `
    <textarea md-textarea [rows]="rows" [cols]="cols" [wrap]="wrap" placeholder="Snacks">
    </textarea>
   `})
class MdTextareaWithBindings {
  rows: number = 4;
  cols: number = 8;
  wrap: string = 'hard';
}
