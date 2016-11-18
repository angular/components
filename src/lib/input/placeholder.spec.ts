import {
  async,
  TestBed,
} from '@angular/core/testing';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MdInputModule} from './index';
import {ProjectionModule} from '../core/projection/projection';

describe('MdPlaceholder', function () {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdInputModule.forRoot(), FormsModule, ProjectionModule.forRoot()],
      declarations: [
        MdPlaceholderStringTestController,
        MdPlaceholderTemplateTestController,
      ],
    });

    TestBed.compileComponents();
  }));

  it('works with string placeholder', () => {
    let fixture = TestBed.createComponent(MdPlaceholderStringTestController);
    fixture.detectChanges();

    let instance: MdPlaceholderStringTestController = fixture.componentInstance;
    let el: HTMLElement = fixture.nativeElement;
    let labelEl: HTMLLabelElement = el.querySelector('label');
    expect(labelEl).not.toBeNull();
    expect(labelEl.textContent).toEqual('string placeholder');

    instance.required = true;
    fixture.detectChanges();
    expect(labelEl.textContent).toEqual('string placeholder *');
  });

  it('works with template placeholder', () => {
    let fixture = TestBed.createComponent(MdPlaceholderTemplateTestController);
    fixture.detectChanges();

    let instance: MdPlaceholderTemplateTestController = fixture.componentInstance;
    let el: HTMLElement = fixture.nativeElement;
    let labelEl: HTMLLabelElement = el.querySelector('label');
    expect(labelEl).not.toBeNull();
    expect(labelEl.textContent).toEqual('template placeholder');
    expect(labelEl.querySelector('b')).not.toBeNull();
    expect(labelEl.querySelector('b').textContent).toEqual('placeholder');

    instance.required = true;
    fixture.detectChanges();
    expect(labelEl.textContent).toEqual('template placeholder *');
  });
});

@Component({template: `<input md-input [required]="required" placeholder="string placeholder">`})
class MdPlaceholderStringTestController {
  required: boolean = false;
}

@Component({template: `
  <input md-input [required]="required" [placeholder]="p">
  <template #p>template <b>placeholder</b></template>
`})
class MdPlaceholderTemplateTestController {
  required: boolean = false;
}
