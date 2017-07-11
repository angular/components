import {Component, ViewEncapsulation} from '@angular/core';
import {TooltipPosition} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'tooltip-demo',
  templateUrl: 'tooltip-demo.html',
  styleUrls: ['tooltip-demo.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TooltipDemo {
  position: TooltipPosition = 'below';
  message: string = 'Here is the tooltip';
  messageHTML: string = `<div class="cust-tt-container">
                          <div class="tt-heading">Likes</div>
                          <div class="tt-items">
                            <div class="tt-item">Michael Stern</div>
                            <div class="tt-item">John Wick</div>
                            <div class="tt-item">Siraj Ul Haq</div>
                            <div class="tt-item">Ahsan Ayaz</div>
                            <div class="tt-item">Barry Allen</div>
                            <div class="tt-item">+ 3 more</div>
                          </div>
                        </div>`;
  disabled = false;
  showDelay = 0;
  hideDelay = 1000;
  isHtml = true;
  showExtraClass = false;
}
