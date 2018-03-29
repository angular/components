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
    document: '/assets/documents/guides/material-getting-started.html',
  },
  {
    id: 'schematics',
    name: 'Schematics',
    document: '/assets/documents/guides/schematics.html'
  },
  {
    id: 'theming',
    name: 'Theming Angular Material',
    document: '/assets/documents/guides/material-theming.html',
  },
  {
    id: 'theming-your-components',
    name: 'Theming your own components',
    document: '/assets/documents/guides/material-theming-your-components.html',
  },
  {
    id: 'typography',
    name: `Using Angular Material's Typography`,
    document: '/assets/documents/guides/material-typography.html',
  },
  {
    id: 'customizing-component-styles',
    name: 'Customizing component styles',
    document: '/assets/documents/guides/material-customizing-component-styles.html'
  },
  {
    id: 'creating-a-custom-form-field-control',
    name: 'Creating a custom form field control',
    document: '/assets/documents/guides/material-creating-a-custom-form-field-control.html'
  },
  {
    id: 'elevation',
    name: 'Using elevation helpers',
    document: '/assets/documents/guides/material-elevation.html'
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
