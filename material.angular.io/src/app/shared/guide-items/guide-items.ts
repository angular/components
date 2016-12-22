import {Injectable} from '@angular/core';

export interface GuideItem {
  id: string;
  name: string;
  document: string;
}

const GUIDES = [
  {
    id: 'readme',
    name: 'Read Me',
    document: '/assets/documents/README.html',
  },
  {
    id: 'card',
    name: 'Card',
    document: '/assets/documents/overview/card.html',
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
