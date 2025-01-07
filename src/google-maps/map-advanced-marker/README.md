# MapAdvancedMarker

The `MapAdvancedMarker` component wraps the [`google.maps.marker.AdvancedMarkerElement` class](https://developers.google.com/maps/documentation/javascript/reference/advanced-markers) from the Google Maps JavaScript API. The `MapAdvancedMarker` component displays a marker on the map when it is a content child of a `GoogleMap` component.

**Note:** Use of `map-advanced-marker` requires a `google-map` with a valid `mapId`.

## Example

```typescript
// google-map-demo.component.ts
import {Component} from '@angular/core';
import {GoogleMap, MapAdvancedMarker} from '@angular/google-maps';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  imports: [GoogleMap, MapAdvancedMarker],
})
export class GoogleMapDemo {
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;
  advancedMarkerOptions: google.maps.marker.AdvancedMarkerElementOptions = {gmpDraggable: false};
  advancedMarkerPositions: google.maps.LatLngLiteral[] = [];

  addAdvancedMarker(event: google.maps.MapMouseEvent) {
    this.advancedMarkerPositions.push(event.latLng.toJSON());
  }
}
```

```html
<!-- google-map-demo.component.html -->
<google-map
  mapId="yourMapId"
  height="400px"
  width="750px"
  [center]="center"
  [zoom]="zoom"
  (mapClick)="addAdvancedMarker($event)">
    @for (position of advancedMarkerPositions; track position) {
      <map-advanced-marker [position]="position" [options]="advancedMarkerOptions" />
    }
</google-map>
```
