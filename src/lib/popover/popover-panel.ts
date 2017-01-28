import {EventEmitter, TemplateRef} from '@angular/core';
import {PopoverPositionX, PopoverPositionY} from './popover-positions';

export interface MdPopoverPanel {
  positionX: PopoverPositionX;
  positionY: PopoverPositionY;
  overlapTrigger: boolean;
  mdPopoverTrigger: string;
  mdPopoverDelay: number;
  mdPopoverPlacement: string;
  closeDisabled: boolean;
  templateRef: TemplateRef<any>;
  close: EventEmitter<void>;
  focusFirstItem: () => void;
  setPositionClasses: (x: PopoverPositionX, y: PopoverPositionY) => void;
}
