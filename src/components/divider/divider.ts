import { 
    Component,
    Directive, 
    ViewEncapsulation    
} from '@angular/core';

/** The inset directive, used to change divider behavior from "full-bleed" to "inset". */
@Directive({    
    selector: 'md-inset'    
})
export class MdInset {}

/**
 * Component that represents a horizontal line, along with styling it according to the Material Design.
 */
@Component({    
    moduleId: module.id,
    selector: 'md-divider',    
    template: '',
    styleUrls: ['divider.css'],
    encapsulation: ViewEncapsulation.None
})
export class MdDivider {}

//Export directives
export const MD_DIVIDER_DIRECTIVES: Array<any> = [MdDivider, MdInset]