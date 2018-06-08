import {Injectable} from '@angular/core';

export interface DocItem {
  id: string;
  name: string;
  packageName?: string;
  examples?: string[];
}

export interface DocCategory {
  id: string;
  name: string;
  items: DocItem[];
  summary?: string;
}

const CDK = 'cdk';
const COMPONENTS = 'components';
export const SECTIONS = {
  [COMPONENTS]: 'Components',
  [CDK]: 'CDK',
};


const DOCS: {[key: string]: DocCategory[]} = {
  [COMPONENTS]: [
    {
      id: 'forms',
      name: 'Form Controls',
      items: [
        {id: 'autocomplete', name: 'Autocomplete', examples: [
          'autocomplete-overview',
          'autocomplete-optgroup',
        ]},
        {id: 'checkbox', name: 'Checkbox', examples: ['checkbox-configurable']},
        {
          id: 'datepicker',
          name: 'Datepicker',
          examples: [
            'datepicker-overview',
            'datepicker-start-view',
            'datepicker-value',
            'datepicker-min-max',
            'datepicker-filter',
            'datepicker-events',
            'datepicker-disabled',
            'datepicker-touch',
            'datepicker-api',
            'datepicker-locale',
            'datepicker-moment',
            'datepicker-formats',

          ]
        },
        {
          id: 'form-field',
          name: 'Form field',
          examples: [
            'form-field-overview',
            'form-field-label',
            'form-field-hint',
            'form-field-error',
            'form-field-prefix-suffix',
            'form-field-theming',
            'form-field-custom-control',
          ]
        },
        {
          id: 'input',
          name: 'Input',
          examples: [
            'input-overview',
            'input-error-state-matcher',
            'text-field-autosize-textarea',
            'input-clearable',
            'input-errors',
            'input-form',
            'input-hint',
            'input-prefix-suffix',
          ]
        },
        {id: 'radio', name: 'Radio button', examples: ['radio-ng-model']},
        {
          id: 'select',
          name: 'Select',
          examples: [
            'select-overview',
            'select-value-binding',
            'select-form',
            'select-hint-error',
            'select-disabled',
            'select-reset',
            'select-optgroup',
            'select-multiple',
            'select-custom-trigger',
            'select-no-ripple',
            'select-panel-class',
            'select-error-state-matcher',
          ]
        },
        {id: 'slider', name: 'Slider', examples: ['slider-configurable']},
        {id: 'slide-toggle', name: 'Slide toggle', examples: ['slide-toggle-configurable']},
      ]
    },
    {
      id: 'nav',
      name: 'Navigation',
      summary: 'Sidenavs, toolbars, menus',
      items: [
        {
          id: 'menu',
          name: 'Menu',
          examples: [
            'menu-overview',
            'menu-icons',
            'nested-menu'
          ]
        },
        {
          id: 'sidenav',
          name: 'Sidenav',
          examples: [
            'sidenav-overview',
            'sidenav-drawer-overview',
            'sidenav-position',
            'sidenav-open-close',
            'sidenav-mode',
            'sidenav-disable-close',
            'sidenav-autosize',
            'sidenav-fixed',
            'sidenav-responsive'
          ]
        },
        {id: 'toolbar', name: 'Toolbar', examples: ['toolbar-multirow']},
      ]
    },
    {
      id: 'layout',
      name: 'Layout',
      items: [
        {id: 'card', name: 'Card', examples: ['card-fancy']},
        {id: 'divider', name: 'Divider', examples: ['divider-overview']},
        {id: 'expansion', name: 'Expansion Panel',
            examples: ['expansion-overview', 'expansion-steps']},
        {id: 'grid-list', name: 'Grid list', examples: ['grid-list-dynamic']},
        {id: 'list', name: 'List', examples: ['list-sections']},
        {id: 'stepper', name: 'Stepper', examples: ['stepper-overview']},
        {id: 'tabs', name: 'Tabs', examples: [
            'tab-group-basic',
            'tab-group-custom-label',
            'tab-group-dynamic-height',
            'tab-group-dynamic',
            'tab-group-header-below',
            'tab-group-lazy-loaded',
            'tab-group-stretched',
            'tab-group-theme',
            'tab-group-async',
            'tab-nav-bar-basic',
          ]},
        {id: 'tree', name: 'Tree', examples: [
          'tree-dynamic',
          'tree-flat-overview',
          'tree-checklist',
          'tree-nested-overview',
          'tree-loadmore',
        ]},
      ]
    },
    {
      id: 'buttons',
      name: 'Buttons & Indicators',
      items: [
        {id: 'button', name: 'Button', examples: ['button-types']},
        {id: 'button-toggle', name: 'Button toggle', examples: ['button-toggle-exclusive']},
        {id: 'badge', name: 'Badge', examples: ['badge-overview']},
        {id: 'chips', name: 'Chips', examples: ['chips-stacked']},
        {id: 'icon', name: 'Icon', examples: ['icon-svg']},
        {id: 'progress-spinner', name: 'Progress spinner',
            examples: ['progress-spinner-configurable']},
        {id: 'progress-bar', name: 'Progress bar', examples: ['progress-bar-configurable']},
      ]
    },
    {
      id: 'modals',
      name: 'Popups & Modals',
      items: [
        {id: 'bottom-sheet', name: 'Bottom Sheet', examples: ['bottom-sheet-overview']},
        {id: 'dialog', name: 'Dialog', examples: ['dialog-overview']},
        {id: 'snack-bar', name: 'Snackbar', examples: ['snack-bar-component']},
        {id: 'tooltip', name: 'Tooltip', examples: [
            'tooltip-overview',
            'tooltip-position',
            'tooltip-custom-class',
            'tooltip-delay',
            'tooltip-disabled',
            'tooltip-manual',
            'tooltip-message',
            'tooltip-modified-defaults',
            'tooltip-auto-hide',
          ]},
      ]
    },
    {
      id: 'tables',
      name: 'Data table',
      items: [
        {id: 'paginator', name: 'Paginator', examples: ['paginator-configurable']},
        {id: 'sort', name: 'Sort header', examples: ['sort-overview']},
        {id: 'table', name: 'Table', examples: [
            'table-basic',
            'table-basic-flex',
            'table-dynamic-columns',
            'table-expandable-rows',
            'table-filtering',
            'table-footer-row',
            'table-http',
            'table-multiple-header-footer',
            'table-overview',
            'table-pagination',
            'table-row-context',
            'table-selection',
            'table-sorting',

            // Expose these examples with 6.3.0 release (sticky table)
            // 'table-sticky-column',
            // 'table-sticky-footer',
            // 'table-sticky-header',
        ]},
      ]
    }
  ],
  [CDK] : [
    {
      id: 'component-composition',
      name: 'Common Behaviors',
      items: [
        {id: 'a11y', name: 'Accessibility', examples: []},
        {id: 'bidi', name: 'Bidirectionality', examples: []},
        {id: 'layout', name: 'Layout', examples: []},
        {id: 'observers', name: 'Observers', examples: []},
        {id: 'overlay', name: 'Overlay', examples: []},
        {id: 'portal', name: 'Portal', examples: []},
        {id: 'scrolling', name: 'Scrolling', examples: []},
      ]
    },
    {
      id: 'components',
      name: 'Components',
      items: [
        {id: 'stepper', name: 'Stepper', examples: []},
        {id: 'table', name: 'Table', examples: []},
        {id: 'tree', name: 'Tree', examples: []},

      ]
    },
    // TODO(jelbourn): re-add utilities and a11y as top-level categories once we can generate
    // their API docs with dgeni. Currently our setup doesn't generate API docs for constants
    // and standalone functions (much of the utilities) and we have no way of generating API
    // docs more granularly than directory-level (within a11y) (same for viewport).
  ]
};

for (let category of DOCS[COMPONENTS]) {
  for (let doc of category.items) {
    doc.packageName = 'material';
  }
}

for (let category of DOCS[CDK]) {
  for (let doc of category.items) {
    doc.packageName = 'cdk';
  }
}

const ALL_COMPONENTS = DOCS[COMPONENTS].reduce(
  (result, category) => result.concat(category.items), []);
const ALL_CDK = DOCS[CDK].reduce((result, cdk) => result.concat(cdk.items), []);
const ALL_DOCS = ALL_COMPONENTS.concat(ALL_CDK);
const ALL_CATEGORIES = DOCS[COMPONENTS].concat(DOCS[CDK]);

@Injectable()
export class DocumentationItems {
  getCategories(section: string): DocCategory[] {
    return DOCS[section];
  }

  getItems(section: string): DocItem[] {
    if (section === COMPONENTS) {
      return ALL_COMPONENTS;
    }
    if (section === CDK) {
      return ALL_CDK;
    }
    return [];
  }

  getItemById(id: string, section: string): DocItem {
    const sectionLookup = section == 'cdk' ? 'cdk' : 'material';
    return ALL_DOCS.find(doc => doc.id === id && doc.packageName == sectionLookup);
  }

  getCategoryById(id: string): DocCategory {
    return ALL_CATEGORIES.find(c => c.id == id);
  }
}
