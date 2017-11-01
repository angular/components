import {Injectable} from '@angular/core';

export interface DocItem {
  id: string;
  name: string;
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
        {id: 'autocomplete', name: 'Autocomplete', examples: ['autocomplete-overview']},
        {id: 'checkbox', name: 'Checkbox', examples: ['checkbox-configurable']},
        {id: 'datepicker', name: 'Datepicker', examples: ['datepicker-overview']},
        {
          id: 'form-field',
          name: 'Form field',
          examples: [
            'form-field-overview',
            'form-field-placeholder',
            'form-field-hint',
            'form-field-error',
            'form-field-prefix-suffix',
            'form-field-theming',
            'form-field-custom-control',
          ]
        },
        {id: 'input', name: 'Input', examples: ['input-form']},
        {id: 'radio', name: 'Radio button', examples: ['radio-ng-model']},
        {id: 'select', name: 'Select', examples: ['select-form']},
        {id: 'slider', name: 'Slider', examples: ['slider-configurable']},
        {id: 'slide-toggle', name: 'Slide toggle', examples: ['slide-toggle-configurable']},
      ]
    },
    {
      id: 'nav',
      name: 'Navigation',
      summary: 'Sidenavs, toolbars, menus',
      items: [
        {id: 'menu', name: 'Menu', examples: ['menu-icons']},
        {id: 'sidenav', name: 'Sidenav', examples: ['sidenav-fab']},
        {id: 'toolbar', name: 'Toolbar', examples: ['toolbar-multirow']},
      ]
    },
    {
      id: 'layout',
      name: 'Layout',
      items: [
        {id: 'list', name: 'List', examples: ['list-sections']},
        {id: 'grid-list', name: 'Grid list', examples: ['grid-list-dynamic']},
        {id: 'card', name: 'Card', examples: ['card-fancy']},
        {id: 'stepper', name: 'Stepper', examples: ['stepper-overview']},
        {id: 'tabs', name: 'Tabs', examples: ['tabs-template-label']},
        {id: 'expansion', name: 'Expansion Panel',
            examples: ['expansion-overview', 'expansion-steps']},
      ]
    },
    {
      id: 'buttons',
      name: 'Buttons & Indicators',
      items: [
        {id: 'button', name: 'Button', examples: ['button-types']},
        {id: 'button-toggle', name: 'Button toggle', examples: ['button-toggle-exclusive']},
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
        {id: 'dialog', name: 'Dialog', examples: ['dialog-overview']},
        {id: 'tooltip', name: 'Tooltip', examples: ['tooltip-position']},
        {id: 'snack-bar', name: 'Snackbar', examples: ['snack-bar-component']},
      ]
    },
    {
      id: 'tables',
      name: 'Data table',
      items: [
        {id: 'table', name: 'Table',
            examples: ['table-filtering', 'table-pagination', 'table-sorting']},
        {id: 'sort', name: 'Sort header', examples: ['sort-overview']},
        {id: 'paginator', name: 'Paginator', examples: ['paginator-configurable']},
      ]
    }
  ],
  [CDK] : [
    {
      id: 'components',
      name: 'Components',
      items: [
        {id: 'table', name: 'Table', examples: []},
        {id: 'stepper', name: 'Stepper', examples: []},

      ]
    },
    {
      id: 'component-composition',
      name: 'Component Composition',
      items: [
        {id: 'observers', name: 'Observers', examples: []},
        {id: 'layout', name: 'Layout', examples: []},
        {id: 'overlay', name: 'Overlay', examples: []},
        {id: 'portal', name: 'Portal', examples: []},
        {id: 'bidi', name: 'Bidirectionality', examples: []},
        {id: 'scrolling', name: 'Scrolling', examples: []},
        {id: 'viewport', name: 'Viewport', examples: []},
      ]
    },
    {
      id: 'utilities',
      name: 'Utilities',
      items: [
        {id: 'coercion', name: 'Coercion', examples: []},
        {id: 'collections', name: 'Collections', examples: []},
        {id: 'keycodes', name: 'Keycodes', examples: []},
        {id: 'platform', name: 'Platform', examples: []},
      ]
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      items: [
        {id: 'focus-key-manager', name: 'Focus Key Manager', examples: []},
        {id: 'focus-trap', name: 'Focus Trap', examples: []},
        {id: 'interactivity-checker', name: 'Interactivity Checker', examples: []},
        {id: 'list-key-manager', name: 'List Key Manager', examples: []},
        {id: 'live-announcer', name: 'Live Announcer', examples: []},
      ]
    },
  ]
};
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

  getItemById(id: string): DocItem {
    return ALL_DOCS.find(i => i.id === id);
  }

  getCategoryById(id: string): DocCategory {
    return ALL_CATEGORIES.find(c => c.id == id);
  }
}
