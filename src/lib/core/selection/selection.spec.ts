import {MdSelectionModel} from './selection';


describe('MdSelectionModel', () => {
  describe('single selection', () => {
    let model: MdSelectionModel;

    beforeEach(() => model = new MdSelectionModel([1, 2, 3]));

    it('should be able to select a single value', () => {
      model.select(1);

      expect(model.selected.length).toBe(1);
      expect(model.isSelected(1)).toBe(true);
    });

    it('should deselect the previously selected value', () => {
      model.select(1);
      model.select(2);

      expect(model.isSelected(1)).toBe(false);
      expect(model.isSelected(2)).toBe(true);
    });

    it('should throw an error when trying to select all of the values', () => {
      expect(() => model.selectAll()).toThrow();
    });

    it('should only preselect one value', () => {
      model = new MdSelectionModel([1, 2, 3], false, [1, 2]);

      expect(model.selected.length).toBe(1);
      expect(model.isSelected(1)).toBe(true);
      expect(model.isSelected(2)).toBe(false);
    });
  });

  describe('multiple selection', () => {
    let model: MdSelectionModel;

    beforeEach(() => model = new MdSelectionModel([1, 2, 3], true));

    it('should be able to select multiple options at the same time', () => {
      model.select(1);
      model.select(2);

      expect(model.selected.length).toBe(2);
      expect(model.isSelected(1)).toBe(true);
      expect(model.isSelected(2)).toBe(true);
    });

    it('should be able to preselect multiple options', () => {
      model = new MdSelectionModel([1, 2, 3], true, [1, 2]);

      expect(model.selected.length).toBe(2);
      expect(model.isSelected(1)).toBe(true);
      expect(model.isSelected(2)).toBe(true);
    });

    it('should be able to select all of the options', () => {
      model.selectAll();
      expect(model.options.every(value => model.isSelected(value))).toBe(true);
    });
  });

  describe('updating the options', () => {
    let model: MdSelectionModel;

    beforeEach(() => model = new MdSelectionModel([1, 2, 3], true));

    it('should be able to update the list of options', () => {
      let newOptions = [1, 2, 3, 4, 5];

      model.options = newOptions;

      expect(model.options).not.toBe(newOptions, 'Expected the array to have been cloned.');
      expect(model.options).toEqual(newOptions);
    });

    it('should keep the selected value', () => {
      model.select(2);

      model.options = [1, 2, 3, 4, 5];

      expect(model.isSelected(2)).toBe(true);
    });

    it('should deselect values that are not longer in the list', () => {
      model.select(1);

      model.options = [2, 3, 4];

      expect(model.isSelected(1)).toBe(false);
    });
  });

  describe('onChange event', () => {
    it('should return both the added and removed values', () => {
      let model = new MdSelectionModel([1, 2, 3]);
      let spy = jasmine.createSpy('MdSelectionModel change event');

      model.select(1);

      model.onChange.subscribe(spy);

      model.select(2);

      let event = spy.calls.mostRecent().args[0];

      expect(spy).toHaveBeenCalled();
      expect(event.removed).toEqual([1]);
      expect(event.added).toEqual([2]);
    });

    describe('selection', () => {
      let model: MdSelectionModel;
      let spy: jasmine.Spy;

      beforeEach(() => {
        model = new MdSelectionModel([1, 2, 3], true);
        spy = jasmine.createSpy('MdSelectionModel change event');

        model.onChange.subscribe(spy);
      });

      it('should emit an event when a value is selected', () => {
        model.select(1);

        let event = spy.calls.mostRecent().args[0];

        expect(spy).toHaveBeenCalled();
        expect(event.added).toEqual([1]);
        expect(event.removed).toEqual([]);
      });

      it('should not emit multiple events for the same value', () => {
        model.select(1);
        model.select(1);

        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('should emit a single event when selecting all of the values', () => {
        model.selectAll();

        let event = spy.calls.mostRecent().args[0];

        expect(spy).toHaveBeenCalledTimes(1);
        expect(event.added).toEqual([1, 2, 3]);
      });

      it('should not emit an event when preselecting values', () => {
        model = new MdSelectionModel([1, 2, 3], false, [1]);
        spy = jasmine.createSpy('MdSelectionModel initial change event');
        model.onChange.subscribe(spy);

        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('deselection', () => {
      let model: MdSelectionModel;
      let spy: jasmine.Spy;

      beforeEach(() => {
        model = new MdSelectionModel([1, 2, 3], true, [1, 2]);
        spy = jasmine.createSpy('MdSelectionModel change event');

        model.onChange.subscribe(spy);
      });

      it('should emit an event when a value is deselected', () => {
        model.deselect(1);

        let event = spy.calls.mostRecent().args[0];

        expect(spy).toHaveBeenCalled();
        expect(event.removed).toEqual([1]);
      });

      it('should not emit an event when a non-selected value is deselected', () => {
        model.deselect(3);
        expect(spy).not.toHaveBeenCalled();
      });

      it('should emit a single event when clearing all of the selected options', () => {
        model.clear();

        let event = spy.calls.mostRecent().args[0];

        expect(spy).toHaveBeenCalledTimes(1);
        expect(event.removed).toEqual([2, 1]);
      });

      it('should emit an event when a value is deselected due to it being removed from the options',
        () => {
          model.options = [4, 5, 6];

          let event = spy.calls.mostRecent().args[0];

          expect(spy).toHaveBeenCalledTimes(1);
          expect(event.removed).toEqual([2, 1]);
        });
    });
  });

  it('should be able to determine whether it is empty', () => {
    let model = new MdSelectionModel([1, 2, 3]);

    expect(model.isEmpty()).toBe(true);

    model.select(1);

    expect(model.isEmpty()).toBe(false);
  });

  it('should throw when trying to select a value that is not in the list of options', () => {
    let model = new MdSelectionModel([]);
    expect(() => model.select(1)).toThrow();
  });

  it('should throw when trying to deselect a value that is not in the list of options', () => {
    let model = new MdSelectionModel([]);
    expect(() => model.deselect(1)).toThrow();
  });

  it('should be able to clear the selected options', () => {
    let model = new MdSelectionModel([1, 2, 3], true);

    model.select(1);
    model.select(2);

    expect(model.selected.length).toBe(2);

    model.clear();

    expect(model.selected.length).toBe(0);
    expect(model.isEmpty()).toBe(true);
  });

  it('should not expose the internal array of options directly', () => {
    let options = [1, 2, 3];
    let model = new MdSelectionModel(options);

    expect(model.options).not.toBe(options, 'Expect the array to be different');
    expect(model.options).toEqual(options);
  });

  it('should not expose the internal array of selected values directly', () => {
    let model = new MdSelectionModel([1, 2, 3], true, [1, 2]);
    let selected = model.selected;

    selected.length = 0;
    expect(model.selected).toEqual([1, 2]);
  });
});
