import {Component, computed, DebugElement, signal} from '@angular/core';
import {ComponentFixture, TestBed, flush, fakeAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Combobox, ComboboxPopup, ComboboxWidget} from '../simple-combobox';
import {Listbox, Option} from '../listbox';
import {runAccessibilityChecks} from '@angular/cdk/testing/private';
import {Tree, TreeItem, TreeItemGroup} from '../tree';
import {NgTemplateOutlet} from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';

describe('SimpleCombobox', () => {
  describe('with Listbox', () => {
    let fixture: ComponentFixture<SimpleComboboxListboxExample>;
    let inputElement: HTMLInputElement;

    const keydown = (key: string, modifierKeys: {} = {}) => {
      focus();
      inputElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          ...modifierKeys,
        }),
      );
      fixture.detectChanges();
    };

    const input = (value: string) => {
      focus();
      inputElement.value = value;
      inputElement.dispatchEvent(new Event('input', {bubbles: true}));
      fixture.detectChanges();
    };

    const click = (element: HTMLElement, eventInit?: PointerEventInit) => {
      focus();
      element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
      fixture.detectChanges();
    };

    const focus = () => {
      inputElement.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
      fixture.detectChanges();
    };

    const blur = (relatedTarget?: EventTarget) => {
      inputElement.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
      fixture.detectChanges();
    };

    const up = (modifierKeys?: {}) => keydown('ArrowUp', modifierKeys);
    const down = (modifierKeys?: {}) => keydown('ArrowDown', modifierKeys);
    const enter = (modifierKeys?: {}) => keydown('Enter', modifierKeys);
    const escape = (modifierKeys?: {}) => keydown('Escape', modifierKeys);

    function setupCombobox(
      opts: {readonly?: boolean; filterMode?: 'manual' | 'auto-select' | 'highlight'} = {},
    ) {
      fixture = TestBed.createComponent(SimpleComboboxListboxExample);
      const testComponent = fixture.componentInstance;

      if (opts.filterMode) {
        testComponent.filterMode.set(opts.filterMode);
      }
      if (opts.readonly) {
        testComponent.readonly.set(true);
      }

      fixture.detectChanges();
      defineTestVariables();
    }

    function defineTestVariables() {
      // In Simple Combobox, ngCombobox is on the input itself!
      const inputDebugElement = fixture.debugElement.query(By.directive(Combobox));
      inputElement = inputDebugElement.nativeElement as HTMLInputElement;
    }

    function getOption(text: string): HTMLElement | null {
      const options = fixture.debugElement
        .queryAll(By.directive(Option))
        .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
      return options.find(option => option.textContent?.trim() === text) || null;
    }

    function getOptions(): HTMLElement[] {
      return fixture.debugElement
        .queryAll(By.directive(Option))
        .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
    }

    afterEach(async () => await runAccessibilityChecks(fixture.nativeElement));

    describe('ARIA attributes and roles', () => {
      beforeEach(() => setupCombobox());

      it('should have the combobox role on the input', () => {
        expect(inputElement.getAttribute('role')).toBe('combobox');
      });

      it('should have aria-haspopup set to listbox', () => {
        focus();
        expect(inputElement.getAttribute('aria-haspopup')).toBe('listbox');
      });

      it('should set aria-controls to the listbox id', () => {
        // Toggle expanded to render overlay
        fixture.componentInstance.popupExpanded.set(true);
        fixture.detectChanges();

        const listbox = fixture.debugElement.query(By.directive(Listbox)).nativeElement;
        expect(inputElement.getAttribute('aria-controls')).toBe(listbox.id);
      });

      it('should set aria-autocomplete to list for manual mode', () => {
        expect(inputElement.getAttribute('aria-autocomplete')).toBe('list');
      });

      it('should set aria-autocomplete to list for auto-select mode', () => {
        fixture.componentInstance.filterMode.set('auto-select');
        fixture.detectChanges();
        expect(inputElement.getAttribute('aria-autocomplete')).toBe('list');
      });

      it('should set aria-autocomplete to both for highlight mode', () => {
        fixture.componentInstance.filterMode.set('highlight');
        fixture.detectChanges();
        expect(inputElement.getAttribute('aria-autocomplete')).toBe('both');
      });

      it('should set aria-expanded to false by default', () => {
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should toggle aria-expanded when opening and closing', () => {
        down();
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });
    });

    describe('Navigation', () => {
      beforeEach(() => setupCombobox());

      it('should navigate to the first item on ArrowDown', () => {
        down();
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[0].id);
      });

      it('should navigate to the last item on ArrowUp', () => {
        up();
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(
          options[options.length - 1].id,
        );
      });
    });

    describe('Selection', () => {
      describe('when filterMode is "manual"', () => {
        beforeEach(() => setupCombobox({filterMode: 'manual'}));

        it('should select on focusout if the input text exactly matches an item', () => {
          focus();
          input('Alabama');
          blur();

          expect(fixture.componentInstance.values()).toEqual(['Alabama']);
        });
      });
    });
  });

  describe('with Tree', () => {
    let fixture: ComponentFixture<SimpleComboboxTreeExample>;
    let inputElement: HTMLInputElement;

    const keydown = (key: string, modifierKeys: {} = {}) => {
      focus();
      inputElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          ...modifierKeys,
        }),
      );
      fixture.detectChanges();
    };

    const input = (value: string) => {
      focus();
      inputElement.value = value;
      inputElement.dispatchEvent(new Event('input', {bubbles: true}));
      fixture.detectChanges();
    };

    const click = (element: HTMLElement, eventInit?: PointerEventInit) => {
      focus();
      element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
      fixture.detectChanges();
    };

    const focus = () => {
      inputElement.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
      fixture.detectChanges();
    };

    const blur = (relatedTarget?: EventTarget) => {
      inputElement.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
      fixture.detectChanges();
    };

    const up = (modifierKeys?: {}) => keydown('ArrowUp', modifierKeys);
    const down = (modifierKeys?: {}) => keydown('ArrowDown', modifierKeys);
    const right = (modifierKeys?: {}) => keydown('ArrowRight', modifierKeys);
    const left = (modifierKeys?: {}) => keydown('ArrowLeft', modifierKeys);

    function setupCombobox(
      opts: {readonly?: boolean; filterMode?: 'manual' | 'auto-select' | 'highlight'} = {},
    ) {
      fixture = TestBed.createComponent(SimpleComboboxTreeExample);
      const testComponent = fixture.componentInstance;

      if (opts.filterMode) {
        testComponent.filterMode.set(opts.filterMode);
      }
      if (opts.readonly) {
        testComponent.readonly.set(true);
      }

      fixture.detectChanges();
      defineTestVariables();
    }

    function defineTestVariables() {
      const inputDebugElement = fixture.debugElement.query(By.directive(Combobox));
      inputElement = inputDebugElement.nativeElement as HTMLInputElement;
    }

    function getTreeItem(text: string): HTMLElement | null {
      const items = fixture.debugElement
        .queryAll(By.directive(TreeItem))
        .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
      return items.find(item => item.textContent?.trim() === text) || null;
    }

    function getTreeItems(): HTMLElement[] {
      return fixture.debugElement
        .queryAll(By.directive(TreeItem))
        .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
    }

    describe('ARIA attributes and roles', () => {
      beforeEach(() => setupCombobox());

      it('should have aria-haspopup set to tree', () => {
        focus();
        expect(inputElement.getAttribute('aria-haspopup')).toBe('tree');
      });

      it('should toggle aria-expanded on parent nodes', () => {
        down();
        const item = getTreeItem('Winter')!;
        expect(item.getAttribute('aria-expanded')).toBe('false');

        right();
        expect(item.getAttribute('aria-expanded')).toBe('true');

        left();
        expect(item.getAttribute('aria-expanded')).toBe('false');
      });
    });
  });
});

@Component({
  template: `
<div class="example-combobox-container">
  <div #origin class="example-combobox-input-container">
    <input
      ngCombobox
      #combobox="ngCombobox"
      [value]="searchString"
      [(expanded)]="popupExpanded"
      [readonly]="readonly()"
      [filterMode]="filterMode()"
      class="example-combobox-input"
    />
  </div>

  <ng-template
    [cdkConnectedOverlay]="{origin, usePopover: 'inline', matchWidth: true}"
    [cdkConnectedOverlayOpen]="popupExpanded()"
    [cdkConnectedOverlayDisableClose]="true"
  >
    <ng-template ngComboboxPopup [combobox]="combobox">
      <div
        ngListbox
        ngComboboxWidget
        class="example-listbox example-popup"
        focusMode="activedescendant"
        [(values)]="values"
      >
        @for (option of options(); track option) {
          <div
            class="example-option example-selectable example-stateful"
            ngOption
            [value]="option"
            [label]="option"
          >
            <span>{{option}}</span>
          </div>
        }
      </div>
    </ng-template>
  </ng-template>
</div>
  `,
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
class SimpleComboboxListboxExample {
  readonly = signal(false);
  searchString = '';
  popupExpanded = signal(false);
  values = signal<string[]>([]);
  filterMode = signal<'manual' | 'auto-select' | 'highlight'>('manual');

  options = computed(() =>
    states.filter(state => state.toLowerCase().startsWith(this.searchString.toLowerCase())),
  );
}

@Component({
  template: `
<div class="example-combobox-container">
  <div #origin class="example-combobox-input-container">
    <input
      ngCombobox
      #combobox="ngCombobox"
      [value]="searchString"
      [(expanded)]="popupExpanded"
      [readonly]="readonly()"
      [filterMode]="filterMode()"
      class="example-combobox-input"
    />
  </div>

  <ng-template
    [cdkConnectedOverlay]="{origin, usePopover: 'inline', matchWidth: true}"
    [cdkConnectedOverlayOpen]="popupExpanded()"
    [cdkConnectedOverlayDisableClose]="true"
  >
    <ng-template ngComboboxPopup [combobox]="combobox" popupType="tree">
      <ul
        ngTree
        ngComboboxWidget
        class="example-tree example-popup"
        focusMode="activedescendant"
        [(values)]="values"
        #tree="ngTree"
      >
        <ng-template
          [ngTemplateOutlet]="treeNodes"
          [ngTemplateOutletContext]="{nodes: nodes(), parent: tree}"
        />
      </ul>
    </ng-template>
  </ng-template>
</div>

<ng-template #treeNodes let-nodes="nodes" let-parent="parent">
  @for (node of nodes; track node.name) {
    <li ngTreeItem
      [parent]="parent"
      [value]="node.name"
      [label]="node.name"
      #treeItem="ngTreeItem"
      class="example-tree-item example-selectable example-stateful"
    >
      {{ node.name }}
    </li>

    @if (node.children) {
      <ul role="group">
        <ng-template ngTreeItemGroup [ownedBy]="treeItem" #group="ngTreeItemGroup">
          <ng-template
            [ngTemplateOutlet]="treeNodes"
            [ngTemplateOutletContext]="{nodes: node.children, parent: group}"
          />
        </ng-template>
      </ul>
    }
  }
</ng-template>
  `,
  imports: [
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    Tree,
    TreeItem,
    TreeItemGroup,
    NgTemplateOutlet,
    OverlayModule,
  ],
})
class SimpleComboboxTreeExample {
  readonly = signal(false);
  searchString = '';
  popupExpanded = signal(false);
  values = signal<string[]>([]);
  nodes = computed(() => this.filterTreeNodes(TREE_NODES));
  filterMode = signal<'manual' | 'auto-select' | 'highlight'>('manual');

  flattenTreeNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.flatMap(node => {
      return node.children ? [node, ...this.flattenTreeNodes(node.children)] : [node];
    });
  }

  filterTreeNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.reduce((acc, node) => {
      const children = node.children ? this.filterTreeNodes(node.children) : undefined;
      if (this.isMatch(node) || (children && children.length > 0)) {
        acc.push({...node, children});
      }
      return acc;
    }, [] as TreeNode[]);
  }

  isMatch(node: TreeNode) {
    return node.name.toLowerCase().includes(this.searchString.toLowerCase());
  }
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

const TREE_NODES = [
  {name: 'Winter', children: [{name: 'December'}, {name: 'January'}, {name: 'February'}]},
  {name: 'Spring', children: [{name: 'March'}, {name: 'April'}, {name: 'May'}]},
  {name: 'Summer', children: [{name: 'June'}, {name: 'July'}, {name: 'August'}]},
  {name: 'Fall', children: [{name: 'September'}, {name: 'October'}, {name: 'November'}]},
];

const states = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
];
