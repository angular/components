import {mixinDisabled, CanDisable} from './mixin-disabled';


describe('MixinDisabled', () => {
  it('should augment an existing class with a disabled property', () => {
    class EmptyClass { }

    let classWithDisabled = mixinDisabled(EmptyClass);
    let instance = new classWithDisabled();

    expect(instance.disabled)
        .toBe(false, 'Expected the mixed-into class to have a disabled property');

    instance.disabled = true;
    expect(instance.disabled)
        .toBe(true, 'Expected the mixed-into class to have an updated disabled property');
  });

  it('should inherit the disabled state from the parent', () => {
    class EmptyParentClass { }
    class EmptyClass { }

    let parentWithDisabled = mixinDisabled(EmptyParentClass);
    let childWithDisabled = mixinDisabled(EmptyClass);

    let parentInstance = new parentWithDisabled();
    let instance = new childWithDisabled();

    instance.withDisabledParent(parentInstance);

    expect(instance.disabled).toBe(false);
    parentInstance.disabled = true;
    expect(instance.disabled).toBe(true);
  });
});
