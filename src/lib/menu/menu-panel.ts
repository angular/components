import {EventEmitter, TemplateRef} from '@angular/core';
import {MenuPositionX, MenuPositionY} from './menu-positions';

export interface MdMenuPanel {
  xPosition: MenuPositionX;
  yPosition: MenuPositionY;
  overlapTrigger: boolean;
  templateRef: TemplateRef<any>;
  close: EventEmitter<void>;
  disableClose: boolean;
  focusFirstItem: () => void;
  setPositionClasses: (x: MenuPositionX, y: MenuPositionY) => void;
  _emitCloseEvent: () => void;
}
