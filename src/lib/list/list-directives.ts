import {Directive} from '@angular/core';


@Directive({ selector: 'md-divider' })
export class MdListDivider { }

/* Need directive for a ContentChild query in list-item */
@Directive({ selector: '[md-list-avatar]' })
export class MdListAvatar { }
