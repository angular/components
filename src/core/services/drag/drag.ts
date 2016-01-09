import {DOM} from "angular2/src/platform/dom/dom_adapter";
import {Json} from "angular2/src/facade/lang";

export class MdDrag {

  private static START_EVENTS = ['mousedown', 'touchstart', 'pointerdown'];
  private static MOVE_EVENTS = ['mousemove', 'touchmove', 'pointermove'];
  private static END_EVENTS = ['mouseup', 'mouseleave', 'touchend', 'touchcancel', 'pointerup', 'pointercancel'];

  private static handlers: any[] = [];
  private static currentItem: any;

  public static init() {
    this.registerEvents();
  }

  public static terminate() {
    this.START_EVENTS.forEach(entry => document.removeEventListener(entry, (ev: PointerEvent) => this.onStartDrag(ev)));
    this.MOVE_EVENTS.forEach(entry => document.removeEventListener(entry, (ev: PointerEvent) => this.onMoveDrag(ev)));
    this.END_EVENTS.forEach(entry => document.removeEventListener(entry, (ev: PointerEvent) => this.onStopDrag(ev)));
  }

  public static register(element: any) {
    element.$mdDrag = true;
    this.handlers.push({
      element: element
    });
  }

  private static registerEvents() {
    this.START_EVENTS.forEach(entry => document.addEventListener(entry, (ev:PointerEvent) => this.onStartDrag(ev)));
    this.MOVE_EVENTS.forEach(entry => document.addEventListener(entry, (ev:PointerEvent) => this.onMoveDrag(ev)));
    this.END_EVENTS.forEach(entry => document.addEventListener(entry, (ev:PointerEvent) => this.onStopDrag(ev)));
  }
  private static createPointer(event: PointerEvent): any {
    return {
      startX: event.pageX,
      startY: event.pageY,
      distanceX: 0,
      distanceY: 0
    };
  }

  private static updatePointer(event: PointerEvent, pointer: any): any {
    pointer.distanceX = event.pageX - pointer.startX;
    pointer.distanceY = event.pageY - pointer.startY;
    return pointer;
  }

  private static triggerEvent(element: Node, suffix: string, pointer: any) {
    element.dispatchEvent(new CustomEvent('$md.' + suffix, {
      detail: {
        pointer: pointer
      }
    }));
  }

  private static onStartDrag(event: PointerEvent) {
    var element = this.getNearestParent(event.srcElement);
    if (!element || this.handlers.indexOf(element) != -1) return;
    event.preventDefault();

    var item = this.findElement(this.handlers, 'element', element);
    item.pointer = this.createPointer(event);

    this.triggerEvent(element, 'dragstart', item.pointer);

    this.currentItem = item;
  }

  private static onMoveDrag(event: PointerEvent) {
    if (!this.currentItem) return;
    event.preventDefault();

    this.currentItem.pointer = this.updatePointer(event, this.currentItem.pointer);

    this.triggerEvent(this.currentItem.element, 'drag', this.currentItem.pointer);
  }

  private static onStopDrag(event: PointerEvent) {
    if (!this.currentItem) return;
    event.preventDefault();

    this.currentItem.pointer = this.updatePointer(event, this.currentItem.pointer);

    this.triggerEvent(this.currentItem.element, 'dragend', this.currentItem.pointer);

    this.currentItem = null;
  }

  //TODO Should be accesible in a util class
  private static getNearestParent(node: any): Node {
    var current = node;
    while (current) {
      if (current.$mdDrag) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }

  private static findElement(arr: any[], propName: string, propValue: any): any {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][propName] == propValue) {
        return arr[i];
      }
    }
  }

}

// Init Class
MdDrag.init();