# MapMarkerClusterer

The `MapMarkerClusterer` component wraps the [`MarkerClusterer` class](https://googlemaps.github.io/js-markerclusterer/classes/MarkerClusterer.html) from the [Google Maps JavaScript MarkerClusterer Library](https://github.com/googlemaps/js-markerclusterer). The `MapMarkerClusterer` component displays a cluster of markers that are children of the `<map-marker-clusterer>` tag. Unlike the other Google Maps components, MapMarkerClusterer does not have an `options` input, so any input (listed in the [documentation](https://googlemaps.github.io/js-markerclusterer/) for the `MarkerClusterer` class) should be set directly.

## Loading the Library

Like the Google Maps JavaScript API, the MarkerClusterer library needs to be loaded separately. This can be accomplished by using this script tag:

```html
<script src="https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js"></script>
```

Additional information can be found by looking at [Marker Clustering](https://developers.google.com/maps/documentation/javascript/marker-clustering) in the Google Maps JavaScript API documentation.

## Example

```typescript
// google-map-demo.component.ts
import {Component} from '@angular/core';
import {GoogleMap, MapMarkerClusterer, MapAdvancedMarker} from '@angular/google-maps';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  imports: [GoogleMap, MapMarkerClusterer, MapAdvancedMarker],
})
export class GoogleMapDemo {
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;
  markerPositions: google.maps.LatLngLiteral[] = [];

  addMarker(event: google.maps.MapMouseEvent) {
    this.markerPositions.push(event.latLng.toJSON());
  }
}
```

```html
<google-map
  height="400px"
  width="750px"
  [center]="center"
  [zoom]="zoom"
  (mapClick)="addMarker($event)">
  <map-marker-clusterer>
    @for (markerPosition of markerPositions; track $index) {
      <map-advanced-marker [position]="markerPosition"/>
    }
  </map-marker-clusterer>
</google-map>
```
