import {
  async,
  TestBed,
} from '@angular/core/testing';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {MdInputModule} from './index';
import {ProjectionModule} from '../core/projection/projection';

fdescribe('MdPlaceholder', function () {
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
    expect(labelEl.innerText).toEqual('string placeholder');

    instance.required = true;
    fixture.detectChanges();
    expect(labelEl.innerText).toEqual('string placeholder *');
  });

  it('works with template placeholder', () => {
    let fixture = TestBed.createComponent(MdPlaceholderTemplateTestController);
    fixture.detectChanges();

    let instance: MdPlaceholderTemplateTestController = fixture.componentInstance;
    let el: HTMLElement = fixture.nativeElement;
    let labelEl: HTMLLabelElement = el.querySelector('label');
    expect(labelEl).not.toBeNull();
    expect(labelEl.innerText).toEqual('template placeholder');

    instance.required = true;
    fixture.detectChanges();
    expect(labelEl.innerText).toEqual('template placeholder *');
  });
});

@Component({template: `<input md-input [required]="required" placeholder="string placeholder">`})
class MdPlaceholderStringTestController {
  required: boolean = false;
}

@Component({template: `
  <input md-input [required]="required" [placeholder]="p">
  <template #p>template placeholder</template>
`})
class MdPlaceholderTemplateTestController {
  required: boolean = false;
}
