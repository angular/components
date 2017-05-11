import {Component, ViewChild, ViewChildren, QueryList} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MdDisabled} from './disabled';
import {MdCommonModule} from './common-module';


describe('MdDisabled', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdCommonModule],
      declarations: [SimpleDisabled, OneLevelNestedDisabled, MultiLevelNestedDisabled]
    }).compileComponents();
  }));

  it('should be able to be disabled on its own', async(() => {
    let fixture = TestBed.createComponent(SimpleDisabled);
    fixture.detectChanges();

    expect(fixture.componentInstance.disabledInstance.disabled).toBe(true,
        'Expected instance to be disabled.');
  }));

  it('should inherit its disabled state from a direct ancestor', async(() => {
    let fixture = TestBed.createComponent(OneLevelNestedDisabled);
    fixture.detectChanges();

    let [parent, child] = fixture.componentInstance.disabledInstances.toArray();

    expect(child.disabled).toBe(false, 'Expected the child to be enabled.');
    expect(parent.disabled).toBe(false, 'Expected the parent to be enabled.');

    fixture.componentInstance.isParentDisabled = true;
    fixture.detectChanges();

    expect(child.disabled).toBe(true, 'Expected the child to be disabled.');
    expect(parent.disabled).toBe(true, 'Expected the parent to be disabled.');
  }));

  it('should inherit its disabled state from an upper-level ancestor', async(() => {
    let fixture = TestBed.createComponent(MultiLevelNestedDisabled);
    fixture.detectChanges();

    let [grandparent, parent, child] = fixture.componentInstance.disabledInstances.toArray();

    expect(child.disabled).toBe(false, 'Expected the child to be enabled.');
    expect(parent.disabled).toBe(false, 'Expected the parent to be enabled.');
    expect(grandparent.disabled).toBe(false, 'Expected the grandparent to be enabled.');

    fixture.componentInstance.isGrandparentDisabled = true;
    fixture.detectChanges();

    expect(child.disabled).toBe(true, 'Expected the child to be disabled.');
    expect(parent.disabled).toBe(true, 'Expected the parent to be disabled.');
    expect(grandparent.disabled).toBe(true, 'Expected the grandparent to be disabled.');
  }));
});


@Component({
  selector: 'simple-disabled',
  template: `<fieldset disabled></fieldset>`
})
class SimpleDisabled {
  @ViewChild(MdDisabled) disabledInstance: MdDisabled;
}


@Component({
  selector: 'one-level-nested-disabled',
  template: `
    <fieldset [disabled]="isParentDisabled">
      <fieldset [disabled]="false"></fieldset>
    </fieldset>
  `
})
class OneLevelNestedDisabled {
  @ViewChildren(MdDisabled) disabledInstances: QueryList<MdDisabled>;
  isParentDisabled = false;
}


@Component({
  selector: 'multi-level-nested-disabled',
  template: `
    <fieldset [disabled]="isGrandparentDisabled">
      <fieldset [disabled]="false">
        <fieldset [disabled]="false"></fieldset>
      </fieldset>
    </fieldset>
  `
})
class MultiLevelNestedDisabled {
  @ViewChildren(MdDisabled) disabledInstances: QueryList<MdDisabled>;
  isGrandparentDisabled = false;
}
