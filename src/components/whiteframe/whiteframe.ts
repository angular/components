import {Component, Input, ElementRef,ViewEncapsulation, OnInit} from 'angular2/core';
import {CONST} from 'angular2/src/facade/lang';

@Component({
    selector: '[md-whiteframe]',
    templateUrl: './components/whiteframe/whiteframe.html',
    styleUrls: ['./components/whiteframe/whiteframe.css'],
    encapsulation: ViewEncapsulation.None
})
export class MdWhiteframe implements OnInit {
    @CONST() static MIN_DP:number = 1;
    @CONST() static MAX_DP:number = 24;
    @CONST() static DEFAULT_DP:number = 4;

    private elevation_:number;

    /** The amount of dp an element should be elevated */
    @Input('md-whiteframe')
    mdWhiteframe:string;


    dpCssClass:string;

    public constructor(public el:ElementRef) {
    }

    ngOnInit() {
        this.elevation_ = parseInt(this.mdWhiteframe, 10) || MdWhiteframe.DEFAULT_DP;

        if (this.elevation_ > MdWhiteframe.MAX_DP || this.elevation_ < MdWhiteframe.MIN_DP) {
            this.elevation_ = MdWhiteframe.DEFAULT_DP;
        }

        this.dpCssClass = 'md-whiteframe-' + this.elevation_ + 'dp';
        this.el.nativeElement.className +=
            (this.el.nativeElement.className !== '' ? ' ' : '') +
            this.dpCssClass;
    }
}
