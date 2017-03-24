"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var FabSpeedDialDemo = (function () {
    function FabSpeedDialDemo() {
        this._fixed = false;
        this.open = false;
        this.spin = false;
        this.direction = 'up';
        this.animationMode = 'fling';
    }
    Object.defineProperty(FabSpeedDialDemo.prototype, "fixed", {
        get: function () { return this._fixed; },
        set: function (fixed) {
            this._fixed = fixed;
            if (this._fixed) {
                this.open = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    FabSpeedDialDemo = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'fab-speed-dial-demo',
            templateUrl: 'fab-speed-dial-demo.html',
            styleUrls: ['fab-speed-dial-demo.css'],
        })
    ], FabSpeedDialDemo);
    return FabSpeedDialDemo;
}());
exports.FabSpeedDialDemo = FabSpeedDialDemo;
