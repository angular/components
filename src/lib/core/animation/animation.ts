export class AnimationCurves {
  static get standardCurve(): string { return 'cubic-bezier(0.4,0.0,0.2,1)'; }
  static get decelerationCurve(): string { return 'cubic-bezier(0.0,0.0,0.2,1)'; }
  static get accelerationCurve(): string { return 'cubic-bezier(0.4,0.0,1,1)'; }
  static get sharpCurve(): string { return 'cubic-bezier(0.4,0.0,0.6,1)'; }
};


export class AnimationDurations {
   static get complex(): string { return '375ms'; }
   static get entering(): string { return '225ms'; }
   static get exiting(): string { return '195ms'; }
 };
