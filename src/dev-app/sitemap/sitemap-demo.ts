/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'sitemap-demo',
  templateUrl: 'sitemap-demo.html',
  styleUrls: ['sitemap-demo.css'],
})
export class SitemapDemo {
  menuItems = [
    {
      sectionName: 'Navigation Category 1',
      items: [
        {
          title: 'Ornare Dolor Porta Dapibus',
          children: [
            { title: 'Sollicitudin Nibh Ligula Malesuada Etiam' },
            { title: 'Dolor Cursus Nibh Ridiculus' },
            { title: 'Tristique Tellus Magna' },
          ],
        },
        {
          title: 'Dolor Cursus Nibh Ridiculus',
          children: [
            { title: 'Tristique Tellus Magna' },
            { title: 'Dolor Cursus Nibh Ridiculus' },
            { title: 'Tristique Tellus Magna' },
          ],
        },
      ],
    },
    {
      sectionName: 'Navigation Category 2',
      items: [
        {
          title: 'Ornare Dolor Porta Dapibus',
          children: [],
        },
        {
          title: 'Mollis Mattis Ipsum Amet Commodo',
          children: [],
        },
        {
          title: 'Sit Ligula Ipsum Venenatis Porta',
          children: [],
        },
      ],
    },
    {
      sectionName: 'Navigation Category 3',
      items: [
        {
          title: 'Ornare Dolor Porta Dapibus',
          children: [
            { title: 'Sollicitudin Nibh Ligula Malesuada Etiam' },
            { title: 'Ornare Dolor Porta Dapibus' },
            { title: 'Dolor Cursus Nibh Ridiculus' },
          ],
        },
        {
          title: 'Tristique Tellus Magna',
          children: [],
        },
        {
          title: 'Mollis Bibendum Pellentesque Venenatis',
          children: [],
        },
        {
          title: 'Cras Pellentesque Sollicitudin',
          children: [],
        },
      ],
    },
    {
      sectionName: 'Navigation Category 4',
      items: [
        {
          title: 'Sollicitudin Nibh Ligula Malesuada Etiam',
          children: [],
        },
        {
          title: 'Ornare Dolor Porta Dapibus',
          children: [
            { title: 'Sollicitudin Nibh Ligula Malesuada Etiam' },
            { title: 'Ornare Dolor Porta Dapibus' },
            { title: 'Dolor Cursus Nibh Ridiculus' },
          ],
        },
      ],
    },
    {
      sectionName: 'Navigation Category 5',
      items: [
        {
          title: 'Ornare Dolor Porta Dapibus',
          children: [
            { title: 'Sollicitudin Nibh Ligula Malesuada Etiam' },
            { title: 'Ornare Dolor Porta Dapibus' },
            { title: 'Dolor Cursus Nibh Ridiculus' },
          ],
        },
        {
          title: 'Tristique Tellus Magna',
          children: [
            { title: 'Mollis Bibendum Pellentesque Venenatis' },
            { title: 'Cras Pellentesque Sollicitudin' },
            { title: 'Mollis Bibendum Pellentesque Venenatis' },
            { title: 'Cras Pellentesque Sollicitudin' },
          ],
        },
      ],
    },
  ];
}
