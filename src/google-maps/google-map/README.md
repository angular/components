# GoogleMap

The `GoogleMap` component wraps the [`google.maps.Map` class](https://developers.google.com/maps/documentation/javascript/reference/map) from the Google Maps JavaScript API. You can configure the map via the component's inputs. The `options` input accepts a full [`google.maps.MapOptions` object](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions), and the component additionally offers convenience inputs for setting the `center` and `zoom` of the map without needing an entire `google.maps.MapOptions` object. The `height` and `width` inputs accept a string to set the size of the Google map. [Events](https://developers.google.com/maps/documentation/javascript/reference/map#Map.bounds_changed) can be bound using the outputs of the `GoogleMap` component, although events have the same name as native mouse events (e.g. `mouseenter`) have been prefixed with "map" as to not collide with the native mouse events. Other members on the `google.maps.Map` object are available on the `GoogleMap` component and can be accessed using the [`ViewChild` decorator](https://angular.dev/api/core/ViewChild) or via [`viewChild`](https://angular.dev/api/core/viewChild).

## Example

```typescript
// google-maps-demo.component.ts
import {Component} from '@angular/core';
import {GoogleMap} from '@angular/google-maps';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  imports: [GoogleMap],
})
export class GoogleMapDemo {

  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;
  display: google.maps.LatLngLiteral;

  moveMap(event: google.maps.MapMouseEvent) {
    this.center = (event.latLng.toJSON());
  }

  move(event: google.maps.MapMouseEvent) {
    this.display = event.latLng.toJSON();
  }
}
```

```html
<!-- google-maps-demo.component.html -->
<google-map
  height="400px"
  width="750px"
  [center]="center"
  [zoom]="zoom"
  (mapClick)="moveMap($event)"
  (mapMousemove)="move($event)" />

<div>Latitude: {{display?.lat}}</div>
<div>Longitude: {{display?.lng}}</div>
```
