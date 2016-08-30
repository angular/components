import {Component, OnInit} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'colorpicker-demo',
  templateUrl: 'colorpicker-demo.html'
})
export class ColorpickerDemo {
  private color: string = '#123456';
  private color2: string = '#654321';
  private change(value: any) {
    console.log('Changed color: ', value);
  }
}
