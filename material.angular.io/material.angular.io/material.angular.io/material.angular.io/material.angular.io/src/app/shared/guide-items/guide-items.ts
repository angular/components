import {Injectable} from '@angular/core';

export interface GuideItem {
  id: string;
  name: string;
  document: string;
}

const GUIDES = [
  {
    id: 'getting-started',
    name: 'Getting started',
    document: '/docs-content/guides/getting-started.html',
  },
  {
    id: 'schematics',
    name: 'Schematics',
    document: '/docs-content/guides/schematics.html'
  },
  {
    id: 'theming',
    name: 'Theming Angular Material',
    document: '/docs-content/guides/theming.html',
  },
  {
    id: 'theming-your-components',
    name: 'Theming your own components',
    document: '/docs-content/guides/theming-your-components.html',
  },
  {
    id: 'typography',
    name: `Using Angular Material's Typography`,
    document: '/docs-content/guides/typography.html',
  },
  {
    id: 'customizing-component-styles',
    name: 'Customizing component styles',
    document: '/docs-content/guides/customizing-component-styles.html'
  },
  {
    id: 'creating-a-custom-form-field-control',
    name: 'Creating a custom form field control',
    document: '/docs-content/guides/creating-a-custom-form-field-control.html'
  },
  {
    id: 'elevation',
    name: 'Using elevation helpers',
    document: '/docs-content/guides/elevation.html'
  },
];

@Injectable()
export class GuideItems {

  getAllItems(): GuideItem[] {
    return GUIDES;
  }

  getItemById(id: string): GuideItem {
    return GUIDES.find(i => i.id === id);
  }
}
